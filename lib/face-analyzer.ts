/**
 * lib/face-analyzer.ts
 * In-browser face shape detection — 100% free, zero CDN, zero API cost.
 *
 * Models are loaded from /public/models/ (your own server).
 * They get there automatically via the postinstall hook in package.json:
 *   node scripts/copy-models.mjs
 * which copies them from node_modules/@vladmandic/face-api/model/
 */

import * as faceapi from '@vladmandic/face-api'

export type FaceShape = 'oval' | 'round' | 'square' | 'heart' | 'oblong' | 'diamond'

export interface FaceAnalysis {
  faceShape: FaceShape
  confidence: number
  measurements: {
    faceRatio: number
    jawToForehead: number
    cheekToJaw: number
    jawSharpness: number
  }
  allScores: Record<FaceShape, number>
}

let modelsLoaded = false
let loadPromise: Promise<void> | null = null

export async function loadModels(): Promise<void> {
  if (modelsLoaded) return
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const MODEL_URL = '/models'

    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
      ])
      modelsLoaded = true
    } catch (err) {
      loadPromise = null // allow retry
      const msg = err instanceof Error ? err.message : String(err)
      throw new Error(
        `Could not load face detection models from /models/.\n` +
        `Make sure you ran: npm install  (postinstall copies models automatically)\n` +
        `Original error: ${msg}`
      )
    }
  })()

  return loadPromise
}

export async function preloadFaceAnalyzer(): Promise<void> {
  await loadModels()
}

// ─── Geometry helpers ─────────────────────────────────────────────────────────

type Pt = { x: number; y: number }

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y)
const avg  = (pts: Pt[]): Pt => ({
  x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
  y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
})

function extractMeasurements(lm: Pt[]) {
  const chin          = lm[8]
  const foreheadProxy = avg([lm[19], lm[24]])
  const faceHeight    = dist(chin, foreheadProxy)

  const foreheadWidth = dist(lm[17], lm[26])           // outer eyebrow corners
  const lCheek        = avg([lm[1], lm[2], lm[3]])
  const rCheek        = avg([lm[13], lm[14], lm[15]])
  const cheekWidth    = dist(lCheek, rCheek)
  const lJaw          = avg([lm[4], lm[5], lm[6]])
  const rJaw          = avg([lm[10], lm[11], lm[12]])
  const jawWidth      = dist(lJaw, rJaw)

  // Jaw sharpness via angle at chin
  const v1    = { x: lm[4].x - chin.x, y: lm[4].y - chin.y }
  const v2    = { x: lm[12].x - chin.x, y: lm[12].y - chin.y }
  const dot   = v1.x * v2.x + v1.y * v2.y
  const mag   = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y)
  const angle = mag > 0 ? Math.acos(Math.min(1, Math.abs(dot / mag))) * (180 / Math.PI) : 90
  const jawSharpness = Math.min(1, angle / 120)

  const faceWidth = cheekWidth

  return {
    faceHeight, faceWidth, foreheadWidth, cheekWidth, jawWidth, jawSharpness,
    faceRatio:     faceHeight    / (faceWidth      || 0.001),
    jawToForehead: jawWidth      / (foreheadWidth   || 0.001),
    cheekToJaw:    cheekWidth    / (jawWidth        || 0.001),
  }
}

function scoreShapes(m: ReturnType<typeof extractMeasurements>): Record<FaceShape, number> {
  const { faceRatio, jawToForehead, cheekToJaw, jawSharpness } = m
  const g = (v: number, t: number, s: number) =>
    Math.round(100 * Math.exp(-0.5 * ((v - t) / s) ** 2))

  return {
    oval:    Math.round(g(faceRatio,1.50,0.20)*0.35 + g(jawToForehead,0.82,0.12)*0.30 + g(jawSharpness,0.45,0.18)*0.20 + g(cheekToJaw,1.15,0.12)*0.15),
    round:   Math.round(g(faceRatio,1.10,0.18)*0.35 + g(jawToForehead,0.92,0.10)*0.25 + g(jawSharpness,0.25,0.15)*0.25 + g(cheekToJaw,1.08,0.10)*0.15),
    square:  Math.round(g(faceRatio,1.20,0.18)*0.25 + g(jawToForehead,0.96,0.10)*0.30 + g(jawSharpness,0.75,0.20)*0.30 + g(cheekToJaw,1.05,0.10)*0.15),
    heart:   Math.round(g(faceRatio,1.30,0.20)*0.20 + g(jawToForehead,0.68,0.12)*0.45 + g(jawSharpness,0.60,0.18)*0.25 + g(cheekToJaw,1.25,0.12)*0.10),
    oblong:  Math.round(g(faceRatio,1.80,0.25)*0.50 + g(jawToForehead,0.88,0.12)*0.20 + g(jawSharpness,0.45,0.20)*0.15 + g(cheekToJaw,1.10,0.12)*0.15),
    diamond: Math.round(g(faceRatio,1.40,0.20)*0.20 + g(jawToForehead,0.78,0.10)*0.25 + g(cheekToJaw,1.32,0.12)*0.40 + g(jawSharpness,0.55,0.18)*0.15),
  }
}

export async function analyseFace(
  img: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
): Promise<FaceAnalysis | null> {
  await loadModels()

  const detection = await faceapi
    .detectSingleFace(img as HTMLImageElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks(true)

  if (!detection) return null

  const lm     = detection.landmarks.positions as Pt[]
  const m      = extractMeasurements(lm)
  const scores = scoreShapes(m)

  const sorted      = (Object.entries(scores) as [FaceShape, number][]).sort((a, b) => b[1] - a[1])
  const [shape, top] = sorted[0]
  const second       = sorted[1]?.[1] ?? 0
  const confidence   = Math.min(97, Math.max(55, top + Math.round((top - second) / 2)))

  return {
    faceShape: shape,
    confidence,
    measurements: {
      faceRatio:     +m.faceRatio.toFixed(2),
      jawToForehead: +m.jawToForehead.toFixed(2),
      cheekToJaw:    +m.cheekToJaw.toFixed(2),
      jawSharpness:  +m.jawSharpness.toFixed(2),
    },
    allScores: scores,
  }
}
