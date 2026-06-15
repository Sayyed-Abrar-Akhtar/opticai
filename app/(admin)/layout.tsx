import Link from 'next/link'
import { ShieldCheck, LayoutDashboard, ImagePlus, Package, LogOut } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-bg-primary">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-white/5 flex flex-col"
        style={{ background: 'rgba(14,20,37,0.8)', backdropFilter: 'blur(12px)' }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent-violet" />
            <span className="font-display font-bold text-sm">
              Optic<span className="text-accent-violet">AI</span>
              <span className="text-text-muted text-xs font-mono ml-1">admin</span>
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { href: '/admin/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
            { href: '/admin/frames',    label: 'Frames',     icon: ImagePlus       },
            { href: '/admin/inventory', label: 'Inventory',  icon: Package         },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all font-medium group">
              <Icon className="w-4 h-4 group-hover:text-accent-violet transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/5">
          <Link href="/api/auth/signout"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-red-400 hover:bg-red-500/5 transition-all">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Link>
          <Link href="/"
            className="mt-1 flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-accent-cyan transition-all text-xs font-mono">
            ← Back to store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )
}
