#!/usr/bin/env node
/**
 * Downloads face-api.js model weights into public/models/
 * Run once after npm install:  node scripts/download-models.mjs
 *
 * Models served locally — zero CDN, zero SSL issues, works offline.
 * Total size: ~6 MB
 */
import { createWriteStream, mkdirSync, existsSync } from 'fs'
import { get }  from 'https'
import { join } from 'path'

const OUT = join(process.cwd(), 'public', 'models')
mkdirSync(OUT, { recursive: true })

// We use @vladmandic/face-api which hosts models on GitHub
const BASE = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model'

const FILES = [
  // Tiny face detector (fast, mobile-friendly)
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  // 68-point face landmarks
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  // Tiny 68-point (faster)
  'face_landmark_68_tiny_model-weights_manifest.json',
  'face_landmark_68_tiny_model-shard1',
]

async function download(filename) {
  const dest = join(OUT, filename)
  if (existsSync(dest)) {
    console.log(`  ✓ already exists: ${filename}`)
    return
  }
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest)
    get(`${BASE}/${filename}`, res => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // Follow redirect
        get(res.headers.location, res2 => {
          res2.pipe(file)
          file.on('finish', () => { file.close(); console.log(`  ↓ downloaded: ${filename}`); resolve() })
        }).on('error', reject)
      } else {
        res.pipe(file)
        file.on('finish', () => { file.close(); console.log(`  ↓ downloaded: ${filename}`); resolve() })
      }
    }).on('error', err => {
      console.error(`  ✗ failed: ${filename}`, err.message)
      reject(err)
    })
  })
}

console.log(`\nDownloading face-api models → ${OUT}\n`)
for (const f of FILES) {
  await download(f).catch(() => {})
}
console.log('\n✅ Done. Models will be served from /models/ with zero external CDN calls.\n')
