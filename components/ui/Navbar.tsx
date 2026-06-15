'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Eye, Scan, Grid3X3, ShieldCheck } from 'lucide-react'

export default function Navbar() {
  const path = usePathname()

  const links = [
    { href: '/',           label: 'Discover',  icon: Grid3X3 },
    { href: '/scan',       label: 'Face Scan', icon: Scan     },
    { href: '/catalogue',  label: 'Catalogue', icon: Eye      },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{ background: 'linear-gradient(to bottom, rgba(8,12,23,0.95) 0%, transparent 100%)',
               backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
               borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full bg-accent-violet/30 group-hover:bg-accent-violet/50 transition-colors" />
          <svg viewBox="0 0 32 32" className="w-8 h-8 relative z-10">
            <ellipse cx="16" cy="16" rx="12" ry="9" fill="none" stroke="#7C3AED" strokeWidth="1.5"/>
            <circle cx="16" cy="16" r="4" fill="none" stroke="#06B6D4" strokeWidth="1.5"/>
            <circle cx="16" cy="16" r="1.5" fill="#06B6D4"/>
            <path d="M4 16 Q10 8 16 16 Q22 24 28 16" fill="none" stroke="rgba(124,58,237,0.4)" strokeWidth="0.8"/>
          </svg>
        </div>
        <span className="font-display font-bold text-lg tracking-tight">
          Optic<span className="text-accent-violet">AI</span>
        </span>
      </Link>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = path === href
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${active
                  ? 'bg-accent-violet/20 text-accent-violet border border-accent-violet/30'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Admin link */}
      <Link href="/admin/dashboard"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-text-muted hover:text-accent-cyan border border-transparent hover:border-accent-cyan/20 transition-all">
        <ShieldCheck className="w-3.5 h-3.5" />
        Admin
      </Link>

      {/* Mobile bottom nav placeholder — rendered separately */}
    </header>
  )
}

// Mobile bottom navigation for phone-first UX
export function MobileNav() {
  const path = usePathname()
  const links = [
    { href: '/',          label: 'Home',    icon: Grid3X3 },
    { href: '/scan',      label: 'Scan',    icon: Scan    },
    { href: '/catalogue', label: 'Frames',  icon: Eye     },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-2"
      style={{ background: 'rgba(8,12,23,0.96)', backdropFilter: 'blur(20px)',
               WebkitBackdropFilter: 'blur(20px)',
               borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {links.map(({ href, label, icon: Icon }) => {
        const active = path === href
        return (
          <Link key={href} href={href}
            className={`flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-all
              ${active ? 'text-accent-violet' : 'text-text-muted'}`}>
            <Icon className={`w-5 h-5 ${active ? 'drop-shadow-[0_0_8px_rgba(124,58,237,0.8)]' : ''}`} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
