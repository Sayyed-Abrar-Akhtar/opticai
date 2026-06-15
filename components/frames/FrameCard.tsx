'use client'
import Image from 'next/image'
import { Sparkles, Tag } from 'lucide-react'
import { Frame } from '@/lib/types'

interface Props {
  frame: Frame
  matchScore?: number
  onTryOn?: (frame: Frame) => void
}

const faceShapeColors: Record<string, string> = {
  oval:    'bg-violet-500/20 text-violet-300 border-violet-500/30',
  round:   'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  square:  'bg-amber-500/20 text-amber-300 border-amber-500/30',
  heart:   'bg-pink-500/20 text-pink-300 border-pink-500/30',
  oblong:  'bg-green-500/20 text-green-300 border-green-500/30',
  diamond: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
}

export default function FrameCard({ frame, matchScore, onTryOn }: Props) {
  return (
    <div className="glass glass-hover rounded-2xl overflow-hidden group transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-bg-elevated overflow-hidden">
        {frame.imageUrl ? (
          <Image
            src={frame.imageUrl}
            alt={frame.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-text-muted">
            <svg viewBox="0 0 80 40" className="w-24 opacity-20">
              <rect x="2" y="8" width="32" height="24" rx="4" fill="none" stroke="currentColor" strokeWidth="2"/>
              <rect x="46" y="8" width="32" height="24" rx="4" fill="none" stroke="currentColor" strokeWidth="2"/>
              <line x1="34" y1="20" x2="46" y2="20" stroke="currentColor" strokeWidth="2"/>
              <line x1="2" y1="20" x2="0" y2="20" stroke="currentColor" strokeWidth="2"/>
              <line x1="78" y1="20" x2="80" y2="20" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        )}

        {/* AI badge */}
        {frame.isAIGenerated && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono bg-accent-violet/30 border border-accent-violet/40 text-violet-200 backdrop-blur-sm">
            <Sparkles className="w-2.5 h-2.5" />
            AI Concept
          </div>
        )}

        {/* Match score */}
        {matchScore !== undefined && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-lg text-[10px] font-mono bg-black/60 backdrop-blur-sm border border-white/10 text-accent-cyan">
            {matchScore}% match
          </div>
        )}

        {/* Try on overlay */}
        {onTryOn && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => onTryOn(frame)}
              className="px-4 py-2 bg-accent-violet rounded-xl text-xs font-display font-semibold text-white shadow-glow-violet transform scale-90 group-hover:scale-100 transition-transform duration-200">
              Try On AR
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">{frame.brand}</p>
          <h3 className="font-display font-semibold text-sm text-text-primary mt-0.5 leading-snug">{frame.name}</h3>
        </div>

        {/* Face shape badges */}
        <div className="flex flex-wrap gap-1">
          {frame.suitableFaceShapes.slice(0, 3).map(shape => (
            <span key={shape}
              className={`badge text-[9px] border ${faceShapeColors[shape] ?? 'bg-white/10 text-text-secondary border-white/20'}`}>
              {shape}
            </span>
          ))}
        </div>

        {/* Price + stock */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <div>
            {frame.price > 0 ? (
              <span className="font-display font-bold text-text-primary">
                NPR {frame.price.toLocaleString()}
              </span>
            ) : (
              <span className="text-xs text-text-muted italic">Contact for price</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3 text-text-muted" />
            <span className="text-[10px] font-mono text-text-muted capitalize">{frame.style}</span>
          </div>
        </div>

        {frame.stock === 0 && (
          <p className="text-[10px] text-amber-400/80 font-mono">Concept only — ask staff to order</p>
        )}
      </div>
    </div>
  )
}
