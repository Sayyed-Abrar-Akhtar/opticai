'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import { Camera, FlipHorizontal, X, Brain } from 'lucide-react'
import { analyseFace, preloadFaceAnalyzer, type FaceAnalysis } from '@/lib/face-analyzer'

interface Props {
  onResult: (analysis: FaceAnalysis, imageDataUrl: string) => void
  onClose?: () => void
}

export default function CameraView({ onResult, onClose }: Props) {
  const videoRef   = useRef<HTMLVideoElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const streamRef  = useRef<MediaStream | null>(null)
  const [ready,       setReady]       = useState(false)
  const [facingMode,  setFacingMode]  = useState<'user' | 'environment'>('user')
  const [countdown,   setCountdown]   = useState<number | null>(null)
  const [analysing,   setAnalysing]   = useState(false)
  const [flash,       setFlash]       = useState(false)
  const [modelReady,  setModelReady]  = useState(false)
  const [noFace,      setNoFace]      = useState(false)

  // Pre-load MediaPipe model
  useEffect(() => {
    preloadFaceAnalyzer().then(() => setModelReady(true)).catch(console.error)
  }, [])

  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setReady(true)
      }
    } catch (err) {
      console.error('Camera error:', err)
    }
  }, [])

  useEffect(() => {
    startCamera(facingMode)
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [facingMode, startCamera])

  const captureAndAnalyse = useCallback(() => {
    if (!ready || !modelReady) return
    setNoFace(false)
    let count = 3
    setCountdown(count)

    const interval = setInterval(() => {
      count--
      if (count > 0) {
        setCountdown(count)
      } else {
        clearInterval(interval)
        setCountdown(null)
        setFlash(true)
        setTimeout(() => setFlash(false), 200)

        const video  = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return

        canvas.width  = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')!
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0)
          ctx.scale(-1, 1)
        }
        ctx.drawImage(video, 0, 0)

        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.92)

        // Run MediaPipe analysis IN THE BROWSER — zero API calls, zero cost
        setAnalysing(true)
        const img = new Image()
        img.onload = async () => {
          try {
            const analysis = await analyseFace(img)
            setAnalysing(false)
            if (!analysis) {
              setNoFace(true)
              return
            }
            onResult(analysis, imageDataUrl)
          } catch (err) {
            console.error('Face analysis error:', err)
            setAnalysing(false)
            setNoFace(true)
          }
        }
        img.src = imageDataUrl
      }
    }, 1000)
  }, [ready, modelReady, facingMode, onResult])

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative rounded-3xl overflow-hidden bg-black aspect-[3/4]">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          playsInline muted
        />

        {/* Scan overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Corner brackets */}
          {[
            'top-6 left-6 border-t-2 border-l-2 rounded-tl-lg',
            'top-6 right-6 border-t-2 border-r-2 rounded-tr-lg',
            'bottom-6 left-6 border-b-2 border-l-2 rounded-bl-lg',
            'bottom-6 right-6 border-b-2 border-r-2 rounded-br-lg',
          ].map((cls, i) => (
            <div key={i} className={`absolute w-8 h-8 ${cls} border-accent-violet`} />
          ))}

          {/* Face oval guide */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-44 h-56 rounded-full border border-accent-violet/40 animate-pulse-glow" />
          </div>

          {/* Scan line */}
          {ready && !analysing && (
            <div className="absolute left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent-cyan to-transparent opacity-60"
              style={{ animation: 'scanLine 3s ease-in-out infinite', top: '50%' }} />
          )}

          {/* Countdown */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl font-display font-black text-white text-glow-violet">{countdown}</span>
            </div>
          )}

          {/* Analysing overlay */}
          {analysing && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
              <Brain className="w-10 h-10 text-accent-violet animate-pulse" />
              <p className="text-sm font-mono text-white">Analysing face shape…</p>
              <p className="text-xs font-mono text-white/50">Running on your device · no data sent</p>
            </div>
          )}

          {/* No face error */}
          {noFace && !analysing && (
            <div className="absolute bottom-16 left-4 right-4 text-center">
              <p className="text-xs text-amber-400 font-mono bg-black/70 rounded-xl px-3 py-2">
                No face detected — try better lighting or move closer
              </p>
            </div>
          )}

          {/* Flash */}
          {flash && <div className="absolute inset-0 bg-white opacity-80" />}
        </div>

        {/* Model loading indicator */}
        {!modelReady && (
          <div className="absolute top-4 left-0 right-0 flex justify-center">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-accent-violet animate-pulse" />
              <span className="text-[10px] font-mono text-white/70">Loading AI model…</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-[10px] text-white/50 font-mono">AI runs on your device · 100% private</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-6 px-4">
        {onClose ? (
          <button onClick={onClose}
            className="w-12 h-12 rounded-full glass flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        ) : <div className="w-12" />}

        <button
          onClick={captureAndAnalyse}
          disabled={!ready || !modelReady || countdown !== null || analysing}
          className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-glow-violet hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 mx-auto">
          <div className="w-16 h-16 rounded-full bg-bg-primary flex items-center justify-center">
            {analysing
              ? <Brain className="w-7 h-7 text-accent-violet animate-pulse" />
              : <Camera className="w-7 h-7 text-accent-violet" />}
          </div>
        </button>

        <button onClick={() => setFacingMode(m => m === 'user' ? 'environment' : 'user')}
          className="w-12 h-12 rounded-full glass flex items-center justify-center text-text-secondary hover:text-accent-cyan transition-colors">
          <FlipHorizontal className="w-5 h-5" />
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        @keyframes scanLine {
          0%,100% { top: 30%; opacity: 0.3; }
          50%      { top: 70%; opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
