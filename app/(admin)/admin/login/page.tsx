'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import NeonButton from '@/components/ui/NeonButton'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.ok) router.push('/admin/dashboard')
    else setError('Invalid email or password')
  }

  return (
    <div className="min-h-screen bg-bg-primary grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent-violet/10 border border-accent-violet/30 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-accent-violet" />
          </div>
          <h1 className="font-display font-black text-2xl gradient-text">Admin Portal</h1>
          <p className="text-text-muted text-sm mt-1 font-mono">OpticAI Management System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4 shadow-glass">
          <div>
            <label className="block text-xs font-mono text-text-muted mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@opticai.com"
              required
              className="w-full bg-bg-elevated border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-violet/50 focus:outline-none focus:ring-1 focus:ring-accent-violet/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-text-muted mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-bg-elevated border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-violet/50 focus:outline-none focus:ring-1 focus:ring-accent-violet/30 transition-all"
              />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 font-mono bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
              {error}
            </p>
          )}

          <NeonButton type="submit" variant="violet" size="md" loading={loading} className="w-full mt-2">
            Sign In
          </NeonButton>
        </form>

        <p className="text-center text-xs text-text-muted mt-6 font-mono">
          Use the seed script to create your first admin account
        </p>
      </div>
    </div>
  )
}
