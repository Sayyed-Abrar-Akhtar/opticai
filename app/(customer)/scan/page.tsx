'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Scan, ArrowRight, AlertCircle, Cpu } from 'lucide-react'
import NeonButton from '@/components/ui/NeonButton'
import GlassCard from '@/components/ui/GlassCard'
import { faceShapeDescriptions, faceShapeEmoji } from '@/lib/face-shapes'
import { type FaceAnalysis } from '@/lib/face-analyzer'

const CameraView = dynamic(() => import('@/components/camera/CameraView'), { ssr: false })

type Stage = 'intro' | 'camera' | 'fetching' | 'error'

export default function ScanPage() {
  const router = useRouter()
  const [stage,  setStage]  = useState<Stage>('intro')
  const [errMsg, setErrMsg] = useState('')

  // Called by CameraView after MediaPipe analysis completes in-browser
  const handleResult = async (analysis: FaceAnalysis, imageDataUrl: string) => {
    setStage('fetching')
    try {
      // Only need to fetch matching frames from DB — face shape already known locally
      const res = await fetch('/api/face-scan', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ faceShape: analysis.faceShape }),
      })
      if (!res.ok) throw new Error('Failed to load frames')
      const data = await res.json()

      sessionStorage.setItem('faceScanResult', JSON.stringify({
        ...analysis,
        ...data,
        capturedImage: imageDataUrl,
      }))
      router.push('/results')
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Something went wrong')
      setStage('error')
    }
  }

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-bg-primary grid-bg pointer-events-none opacity-40" />
      <div className="fixed inset-0 bg-hero-gradient pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto px-4 pt-4">
        {stage === 'intro' && (
          <div className="animate-fade-up space-y-6">
            <div className="text-center pt-4">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-accent-violet/10 border border-accent-violet/30 flex items-center justify-center animate-float">
                <Scan className="w-9 h-9 text-accent-violet" />
              </div>
              <h1 className="font-display font-black text-3xl gradient-text mb-2">Face Scan</h1>
              <p className="text-text-secondary text-sm leading-relaxed max-w-xs mx-auto">
                AI analyses your face shape entirely on your device — no data ever leaves your phone.
              </p>
            </div>

            {/* Privacy badge */}
            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full glass border border-accent-cyan/20 text-xs font-mono text-accent-cyan mx-auto w-fit">
              <Cpu className="w-3.5 h-3.5" />
              Runs on-device · no server · no API cost
            </div>

            {/* Face shape grid */}
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(faceShapeDescriptions).map(([shape, desc]) => (
                <GlassCard key={shape} className="p-3 text-center" hover={false}>
                  <div className="text-2xl mb-1">{faceShapeEmoji[shape as keyof typeof faceShapeEmoji]}</div>
                  <div className="font-display font-semibold text-xs capitalize text-text-primary">{shape}</div>
                  <div className="text-[9px] text-text-muted mt-0.5 leading-tight">{desc.split('.')[0]}</div>
                </GlassCard>
              ))}
            </div>

            {/* Tips */}
            <GlassCard hover={false} className="space-y-2">
              <p className="text-xs font-display font-semibold text-text-secondary uppercase tracking-wider">For best results</p>
              {['Good lighting on your face', 'Look directly at camera', 'Remove existing glasses', 'Keep hair away from face'].map((tip, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                  <div className="w-1 h-1 rounded-full bg-accent-cyan flex-shrink-0" />
                  {tip}
                </div>
              ))}
            </GlassCard>

            <NeonButton variant="violet" size="lg" className="w-full" onClick={() => setStage('camera')}>
              <Scan className="w-4 h-4" /> Open Camera
            </NeonButton>
          </div>
        )}

        {stage === 'camera' && (
          <div className="animate-fade-up">
            <CameraView onResult={handleResult} onClose={() => setStage('intro')} />
          </div>
        )}

        {stage === 'fetching' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-up">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-full border-2 border-accent-violet/30 animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-3 rounded-full border border-accent-cyan/30 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Scan className="w-8 h-8 text-accent-violet animate-pulse" />
              </div>
            </div>
            <h2 className="font-display font-bold text-xl text-text-primary mb-2">Finding your frames…</h2>
            <p className="text-text-muted text-sm font-mono">Matching your face shape to inventory</p>
          </div>
        )}

        {stage === 'error' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-up">
            <div className="w-20 h-20 mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <AlertCircle className="w-9 h-9 text-red-400" />
            </div>
            <h2 className="font-display font-bold text-xl mb-2">Something went wrong</h2>
            <p className="text-text-muted text-sm mb-8">{errMsg}</p>
            <NeonButton variant="violet" onClick={() => setStage('camera')}>
              Try Again <ArrowRight className="w-4 h-4" />
            </NeonButton>
          </div>
        )}
      </div>
    </div>
  )
}
