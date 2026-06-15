import Link from 'next/link'
import { Scan, Sparkles, TrendingUp, ArrowRight } from 'lucide-react'
import { getDb } from '@/lib/mongodb'
import FrameCard from '@/components/frames/FrameCard'
import { Frame } from '@/lib/types'

async function getFeaturedFrames(): Promise<Frame[]> {
  try {
    const db = await getDb()
    const frames = await db.collection('frames')
      .find({ isFeatured: true, stock: { $gt: 0 } })
      .sort({ trendScore: -1 })
      .limit(6)
      .toArray()
    return frames.map(f => ({ ...f, _id: f._id.toString() })) as Frame[]
  } catch {
    return []
  }
}

async function getTrendingFrames(): Promise<Frame[]> {
  try {
    const db = await getDb()
    const frames = await db.collection('frames')
      .find({ stock: { $gt: 0 } })
      .sort({ trendScore: -1 })
      .limit(8)
      .toArray()
    return frames.map(f => ({ ...f, _id: f._id.toString() })) as Frame[]
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [featured, trending] = await Promise.all([getFeaturedFrames(), getTrendingFrames()])

  return (
    <div className="relative">
      {/* Background */}
      <div className="fixed inset-0 bg-bg-primary grid-bg pointer-events-none" />
      <div className="fixed inset-0 bg-hero-gradient pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4">
        {/* Hero */}
        <section className="pt-8 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-accent-violet/30 text-xs font-mono text-accent-violet mb-6 animate-fade-up">
            <Sparkles className="w-3 h-3" />
            AI-Powered Eyewear Matching
          </div>

          <h1 className="font-display font-black text-4xl md:text-5xl leading-tight mb-4 animate-fade-up stagger-1">
            <span className="gradient-text">See Your Future</span>
            <br />
            <span className="text-text-primary">in Perfect Frames</span>
          </h1>

          <p className="text-text-secondary text-base leading-relaxed mb-8 max-w-sm mx-auto animate-fade-up stagger-2">
            Scan your face with AI. Get frames matched precisely to your face shape. Try them on in AR before you buy.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up stagger-3">
            <Link href="/scan"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-accent-violet hover:bg-violet-500 text-white rounded-2xl font-display font-semibold text-sm shadow-glow-violet transition-all hover:scale-105 active:scale-95">
              <Scan className="w-4 h-4" />
              Scan My Face
            </Link>
            <Link href="/catalogue"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 glass border border-white/10 text-text-primary rounded-2xl font-display font-medium text-sm hover:border-accent-violet/30 transition-all">
              Browse All Frames
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-10 animate-fade-up stagger-4">
            {[
              { label: 'Face Shapes', value: '6' },
              { label: 'Frame Styles', value: '12+' },
              { label: 'AI Accuracy', value: '94%' },
            ].map(({ label, value }) => (
              <div key={label} className="glass rounded-2xl p-3 text-center">
                <div className="font-display font-black text-2xl gradient-text">{value}</div>
                <div className="text-[10px] text-text-muted font-mono mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Face scan CTA card */}
        <section className="mb-10">
          <div className="relative rounded-3xl overflow-hidden p-6 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.08) 100%)',
                     border: '1px solid rgba(124,58,237,0.25)' }}>
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <svg viewBox="0 0 200 200" className="w-64">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#7C3AED" strokeWidth="0.5"/>
                <circle cx="100" cy="100" r="60" fill="none" stroke="#06B6D4" strokeWidth="0.5"/>
                <circle cx="100" cy="100" r="30" fill="none" stroke="#7C3AED" strokeWidth="0.5"/>
              </svg>
            </div>
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-violet/20 border border-accent-violet/40 flex items-center justify-center animate-float">
                <Scan className="w-7 h-7 text-accent-violet" />
              </div>
              <h2 className="font-display font-bold text-xl text-text-primary mb-2">Find Your Perfect Frames</h2>
              <p className="text-sm text-text-secondary mb-5 max-w-xs mx-auto">
                Our AI analyses your face shape in seconds and recommends frames that will genuinely suit you.
              </p>
              <Link href="/scan"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent-violet rounded-xl text-white font-display font-semibold text-sm shadow-glow-sm hover:shadow-glow-violet transition-all hover:scale-105">
                <Scan className="w-4 h-4" />
                Start Face Scan
              </Link>
            </div>
          </div>
        </section>

        {/* Featured frames */}
        {featured.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-violet" />
                Featured
              </h2>
              <Link href="/catalogue" className="text-xs text-accent-cyan hover:text-cyan-300 font-mono transition-colors">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {featured.map(frame => (
                <FrameCard key={String(frame._id)} frame={frame} />
              ))}
            </div>
          </section>
        )}

        {/* Trending */}
        {trending.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-text-primary flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent-cyan" />
                Trending Now
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {trending.map(frame => (
                <FrameCard key={String(frame._id)} frame={frame} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {featured.length === 0 && trending.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full glass flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-text-muted" />
            </div>
            <p className="text-text-muted font-mono text-sm mb-2">No frames in inventory yet</p>
            <p className="text-text-muted/60 text-xs">Add frames via the Admin portal</p>
            <Link href="/admin/dashboard"
              className="inline-flex items-center gap-1 mt-4 text-xs text-accent-violet hover:text-violet-300 font-mono transition-colors">
              Go to Admin →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
