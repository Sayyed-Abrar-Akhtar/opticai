'use client'
import { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'violet' | 'cyan' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export default function NeonButton({
  variant = 'violet',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...rest
}: Props) {
  const variants = {
    violet: 'bg-accent-violet hover:bg-violet-500 text-white shadow-glow-sm hover:shadow-glow-violet border border-violet-500/30',
    cyan:   'bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan border border-accent-cyan/40 hover:shadow-glow-cyan',
    ghost:  'bg-transparent hover:bg-white/5 text-text-secondary border border-border-glass hover:border-border-glow hover:text-text-primary',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  }

  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-display font-medium
        transition-all duration-200 ease-out
        disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...rest}
    >
      {loading ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Processing…
        </>
      ) : children}
    </button>
  )
}
