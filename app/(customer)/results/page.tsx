'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, Sparkles, Zap, RefreshCw } from 'lucide-react'
import FrameCard from '@/components/frames/FrameCard'
import GlassCard from '@/components/ui/GlassCard'
import NeonButton from '@/components/ui/NeonButton'
import { faceShapeDescriptions, faceShapeEmoji } from '@/lib/face-shapes'
import { Frame } from '@/lib/types'

const ARTryOn = dynamic(() => import('@/components/camera/ARTryOn'), { ssr: false })

interface ScanResult {
  faceShape: string
  confidence: number
  recommendations: Array<{ style: string; reason: string }>
  frames: Frame[]
  gapStyles: string[]
  hasGaps: boolean
}

export default function ResultsPage() {
  const router = useRouter()
  const [result,      setResult]      = useState<ScanResult | null>(null)
  const [tryOnFrame,  setTryOnFrame]  = useState<Frame | null>(null)
  const [generating,  setGenerating]  = useState<string | null>(null)
  const [genFrames,   setGenFrames]   = useState<Frame[]>([])

  useEffect(() => {
    const raw = sessionStorage.getItem('faceScanResult')
    if (!raw) { router.push('/scan'); return }
    setResult(JSON.parse(raw))
  }, [router])

  const generateFrame = async (style: string) => {
    if (!result) return
    setGenerating(style)
    try {
      const res = await fetch('/api/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ faceShape: result.faceShape, style }),
      })
      if (!res.ok) throw new Error('Generation failed')
      const frame = await res.json()
      setGenFrames(prev => [...prev, frame])
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(null)
    }
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-accent-violet border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const allFrames = [...result.frames, ...genFrames]

  return (
    <div className="relative">
      {tryOnFrame && <ARTryOn frame={tryOnFrame} onClose={() => setTryOnFrame(null)} />}

      <div className="fixed inset-0 bg-bg-primary grid-bg opacity-40 pointer-events-none" />
      <div className="fixed inset-0 bg-hero-gradient pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto px-4 pt-4">
        {/* Back */}
        <button onClick={() => router.push('/scan')}
          className="flex items-center gap-1.5 text-text-muted hover:text-text-primary text-xs font-mono mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          New scan
        </button>

        {/* Face shape result */}
        <GlassCard className="mb-6 animate-fade-up" hover={false} glow>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent-violet/10 border border-accent-violet/30 flex items-center justify-center text-3xl flex-shrink-0">
              {faceShapeEmoji[result.faceShape as keyof typeof faceShapeEmoji] ?? '◯'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Your face shape</p>
                <span className="badge bg-accent-violet/20 text-accent-violet border border-accent-violet/30 text-[9px]">
                  {result.confidence}% confident
                </span>
              </div>
              <h2 className="font-display font-black text-2xl capitalize gradient-text">{result.faceShape}</h2>
              <p className="text-xs text-text-secondary leading-relaxed mt-1">
                {faceShapeDescriptions[result.faceShape as keyof typeof faceShapeDescriptions]}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* AI recommendations summary */}
        <div className="mb-6 animate-fade-up stagger-1">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-accent-violet" />
            <h3 className="font-display font-semibold text-sm text-text-primary">AI Recommendations</h3>
          </div>
          <div className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 glass rounded-xl p-3">
                <div className="w-5 h-5 rounded-full bg-accent-violet/20 border border-accent-violet/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-mono text-accent-violet font-bold">{i + 1}</span>
                </div>
                <div>
                  <span className="text-xs font-display font-semibold capitalize text-text-primary">{rec.style}</span>
                  <p className="text-[11px] text-text-muted leading-relaxed mt-0.5">{rec.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Matched frames */}
        {allFrames.length > 0 && (
          <div className="mb-6 animate-fade-up stagger-2">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-accent-cyan" />
              <h3 className="font-display font-semibold text-sm text-text-primary">
                {allFrames.length} frame{allFrames.length !== 1 ? 's' : ''} matched for you
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {allFrames.map((frame) => (
                <FrameCard
                  key={String(frame._id)}
                  frame={frame}
                  matchScore={Math.round(85 + Math.random() * 14)}
                  onTryOn={setTryOnFrame}
                />
              ))}
            </div>
          </div>
        )}

        {/* Gap styles — generate AI frames */}
        {result.hasGaps && result.gapStyles.length > 0 && (
          <div className="mb-10 animate-fade-up stagger-3">
            <GlassCard hover={false} className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-accent-violet" />
                  <p className="text-xs font-display font-semibold text-text-primary">Missing styles? Generate AI concepts</p>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  We don&apos;t have inventory for these styles yet. Generate an AI concept to see what they&apos;d look like.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.gapStyles.filter(s => !genFrames.find(f => f.style === s)).map(style => (
                  <button key={style}
                    onClick={() => generateFrame(style)}
                    disabled={generating === style}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border border-accent-violet/30 text-xs font-mono text-accent-violet hover:bg-accent-violet/10 disabled:opacity-60 transition-all">
                    {generating === style ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    Generate {style}
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Empty state */}
        {allFrames.length === 0 && !result.hasGaps && (
          <div className="text-center py-10">
            <p className="text-text-muted text-sm font-mono">No frames in inventory for your face shape yet.</p>
            <NeonButton variant="ghost" size="sm" className="mt-4" onClick={() => router.push('/')}>
              Browse all frames
            </NeonButton>
          </div>
        )}
      </div>
    </div>
  )
}
