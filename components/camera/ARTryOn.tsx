'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import * as faceapi from '@vladmandic/face-api'
import { loadModels } from '@/lib/face-analyzer'
import { Frame } from '@/lib/types'
import { X, RefreshCw } from 'lucide-react'

interface Props { frame: Frame; onClose: () => void }

export default function ARTryOn({ frame, onClose }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef    = useRef<number>(0)
  const frameImg  = useRef<HTMLImageElement | null>(null)
  const [status, setStatus] = useState<'loading' | 'running' | 'error'>('loading')
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      try {
        await loadModels()   // uses /public/models — no CDN
        if (cancelled) return

        // Load frame image
        await new Promise<void>((res, rej) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload  = () => { frameImg.current = img; res() }
          img.onerror = () => rej(new Error('Frame image failed to load'))
          img.src = frame.imageUrl || '/frame-placeholder.svg'
        })

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setStatus('running')
      } catch (e) {
        setStatus('error')
        setErrMsg(e instanceof Error ? e.message : 'Failed to start AR')
      }
    }
    init()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
      cancelAnimationFrame(rafRef.current)
    }
  }, [frame.imageUrl])

  useEffect(() => {
    if (status !== 'running') return
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const draw = async () => {
      if (video.readyState >= 2) {
        canvas.width  = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')!

        // Mirror video
        ctx.save()
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(video, 0, 0)
        ctx.restore()

        try {
          const det = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks(true)

          if (det && frameImg.current) {
            const lm = det.landmarks
            const leftEye  = lm.getLeftEye()
            const rightEye = lm.getRightEye()

            // Mirror x coords (because we mirrored video)
            const mx = (pts: {x:number;y:number}[]) =>
              pts.map(p => ({ x: canvas.width - p.x, y: p.y }))

            const le = mx(leftEye)
            const re = mx(rightEye)
            const lcx = le.reduce((s,p) => s+p.x, 0) / le.length
            const lcy = le.reduce((s,p) => s+p.y, 0) / le.length
            const rcx = re.reduce((s,p) => s+p.x, 0) / re.length
            const rcy = re.reduce((s,p) => s+p.y, 0) / re.length

            const eyeW   = Math.abs(rcx - lcx)
            const frameW = eyeW * 2.7
            const frameH = frameW * (frameImg.current.height / frameImg.current.width)
            const cx     = (lcx + rcx) / 2
            const cy     = (lcy + rcy) / 2
            const angle  = Math.atan2(rcy - lcy, rcx - lcx)

            ctx.save()
            ctx.translate(cx, cy - frameH * 0.12)
            ctx.rotate(angle)
            ctx.globalAlpha = 0.93
            ctx.drawImage(frameImg.current, -frameW / 2, -frameH / 2, frameW, frameH)
            ctx.restore()
          }
        } catch { /* skip on detection errors */ }
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [status])

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div className="relative w-full max-w-md">
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-[10px] font-mono text-accent-cyan">AR Try-On · on-device</p>
            <p className="text-sm font-display font-semibold text-white">{frame.name}</p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-black">
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-0" playsInline muted />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />

          {status === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-accent-violet animate-spin" />
              <p className="text-sm text-white/60 font-mono">Loading AR…</p>
            </div>
          )}
          {status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-8 text-center">
              <p className="text-sm text-red-400 font-mono">{errMsg}</p>
              <p className="text-xs text-white/40">Allow camera access and try again</p>
            </div>
          )}
        </div>
        <p className="text-center text-xs text-white/30 font-mono mt-3">All processing on your device · no data sent</p>
      </div>
    </div>
  )
}
