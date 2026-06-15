'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Trash2, Star, StarOff, RefreshCw, Package } from 'lucide-react'
import NeonButton from '@/components/ui/NeonButton'
import { Frame } from '@/lib/types'

export default function InventoryPage() {
  const [frames,   setFrames]   = useState<Frame[]>([])
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/frames?limit=100')
    const data = await res.json()
    setFrames(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleFeatured = async (frame: Frame) => {
    await fetch(`/api/frames?id=${frame._id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ isFeatured: !frame.isFeatured }),
    })
    load()
  }

  const updateStock = async (frame: Frame, stock: number) => {
    await fetch(`/api/frames?id=${frame._id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ stock }),
    })
    load()
  }

  const deleteFrame = async (id: string) => {
    if (!confirm('Delete this frame?')) return
    setDeleting(id)
    await fetch(`/api/frames?id=${id}`, { method: 'DELETE' })
    setDeleting(null)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl text-text-primary">Inventory</h1>
          <p className="text-text-muted text-sm font-mono mt-1">{frames.length} frames total</p>
        </div>
        <NeonButton variant="ghost" size="sm" onClick={load}>
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </NeonButton>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 text-accent-violet animate-spin" />
        </div>
      ) : frames.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
          <p className="text-text-muted font-mono text-sm">No frames yet. Upload some!</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden shadow-glass">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-white/5">
                  {['Image', 'Name', 'Style', 'Fits', 'Stock', 'Price', 'Featured', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-mono text-text-muted whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {frames.map((frame, i) => (
                  <tr key={String(frame._id)}
                    className={`border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                    {/* Image */}
                    <td className="px-4 py-3">
                      <div className="relative w-12 h-9 rounded-lg overflow-hidden bg-bg-elevated">
                        {frame.imageUrl && <Image src={frame.imageUrl} alt={frame.name} fill className="object-cover" />}
                      </div>
                    </td>
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm text-text-primary max-w-[140px] truncate">{frame.name}</div>
                      <div className="text-[10px] text-text-muted font-mono">{frame.brand}</div>
                    </td>
                    {/* Style */}
                    <td className="px-4 py-3">
                      <span className="badge bg-accent-violet/15 text-accent-violet border-accent-violet/30 capitalize">{frame.style}</span>
                    </td>
                    {/* Fits */}
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap max-w-[120px]">
                        {frame.suitableFaceShapes.slice(0, 2).map(s => (
                          <span key={s} className="badge bg-white/10 text-text-muted border-white/10 text-[9px]">{s}</span>
                        ))}
                        {frame.suitableFaceShapes.length > 2 && (
                          <span className="text-[9px] text-text-muted font-mono">+{frame.suitableFaceShapes.length - 2}</span>
                        )}
                      </div>
                    </td>
                    {/* Stock */}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        defaultValue={frame.stock}
                        onBlur={e => updateStock(frame, parseInt(e.target.value) || 0)}
                        className="w-16 bg-bg-elevated border border-white/10 rounded-lg px-2 py-1 text-xs text-text-primary text-center focus:border-accent-violet/50 focus:outline-none"
                      />
                    </td>
                    {/* Price */}
                    <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                      {frame.price > 0 ? `NPR ${frame.price.toLocaleString()}` : '—'}
                    </td>
                    {/* Featured */}
                    <td className="px-4 py-3">
                      <button onClick={() => toggleFeatured(frame)}
                        className={`transition-colors ${frame.isFeatured ? 'text-amber-400 hover:text-amber-500' : 'text-text-muted hover:text-amber-400'}`}>
                        {frame.isFeatured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                      </button>
                    </td>
                    {/* Delete */}
                    <td className="px-4 py-3">
                      <button onClick={() => deleteFrame(String(frame._id))}
                        disabled={deleting === String(frame._id)}
                        className="text-text-muted hover:text-red-400 transition-colors disabled:opacity-40">
                        {deleting === String(frame._id)
                          ? <RefreshCw className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
