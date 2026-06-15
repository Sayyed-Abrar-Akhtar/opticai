import { getDb } from '@/lib/mongodb'
import Link from 'next/link'
import { ImagePlus, Package, Sparkles, TrendingUp } from 'lucide-react'

async function getStats() {
  try {
    const db = await getDb()
    const [total, inStock, aiGen, featured] = await Promise.all([
      db.collection('frames').countDocuments({}),
      db.collection('frames').countDocuments({ stock: { $gt: 0 } }),
      db.collection('frames').countDocuments({ isAIGenerated: true }),
      db.collection('frames').countDocuments({ isFeatured: true }),
    ])
    const recent = await db.collection('frames')
      .find({}).sort({ createdAt: -1 }).limit(5).toArray()
    return { total, inStock, aiGen, featured, recent: recent.map(f => ({ ...f, _id: f._id.toString() })) }
  } catch {
    return { total: 0, inStock: 0, aiGen: 0, featured: 0, recent: [] }
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const cards = [
    { label: 'Total Frames',    value: stats.total,    icon: Package,    color: 'violet' },
    { label: 'In Stock',        value: stats.inStock,  icon: TrendingUp, color: 'cyan'   },
    { label: 'AI Generated',    value: stats.aiGen,    icon: Sparkles,   color: 'violet' },
    { label: 'Featured',        value: stats.featured, icon: TrendingUp, color: 'cyan'   },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-black text-2xl text-text-primary">Dashboard</h1>
        <p className="text-text-muted text-sm font-mono mt-1">OpticAI inventory overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-2xl p-5 shadow-glass">
            <div className={`w-9 h-9 rounded-xl mb-3 flex items-center justify-center
              ${color === 'violet' ? 'bg-accent-violet/15 text-accent-violet' : 'bg-accent-cyan/15 text-accent-cyan'}`}>
              <Icon className="w-4.5 h-4.5" />
            </div>
            <div className="font-display font-black text-3xl text-text-primary">{value}</div>
            <div className="text-xs text-text-muted font-mono mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-display font-semibold text-sm text-text-secondary uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/admin/frames"
            className="glass glass-hover rounded-2xl p-5 flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-accent-violet/15 flex items-center justify-center group-hover:bg-accent-violet/25 transition-colors">
              <ImagePlus className="w-5 h-5 text-accent-violet" />
            </div>
            <div>
              <div className="font-display font-semibold text-sm text-text-primary">Upload Frame</div>
              <div className="text-xs text-text-muted">Add & classify new frames</div>
            </div>
          </Link>
          <Link href="/admin/inventory"
            className="glass glass-hover rounded-2xl p-5 flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/15 flex items-center justify-center group-hover:bg-accent-cyan/25 transition-colors">
              <Package className="w-5 h-5 text-accent-cyan" />
            </div>
            <div>
              <div className="font-display font-semibold text-sm text-text-primary">Inventory</div>
              <div className="text-xs text-text-muted">Manage stock & pricing</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent frames */}
      {stats.recent.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-sm text-text-secondary uppercase tracking-wider mb-3">Recently Added</h2>
          <div className="glass rounded-2xl overflow-hidden shadow-glass">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-mono text-text-muted">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-text-muted">Style</th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-text-muted">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-text-muted">Price</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((frame: Record<string, unknown>, i: number) => (
                  <tr key={String(frame._id)} className={`border-b border-white/5 last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                    <td className="px-4 py-3 text-sm text-text-primary font-medium">{String(frame.name)}</td>
                    <td className="px-4 py-3 text-xs text-text-muted font-mono capitalize">{String(frame.style ?? '—')}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-[10px] ${Number(frame.stock) > 0 ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'}`}>
                        {String(frame.stock ?? 0)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {Number(frame.price) > 0 ? `NPR ${Number(frame.price).toLocaleString()}` : '—'}
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
