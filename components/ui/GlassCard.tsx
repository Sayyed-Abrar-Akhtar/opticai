'use client'
import { HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean
  hover?: boolean
}

export default function GlassCard({ className = '', glow = false, hover = true, children, ...rest }: Props) {
  return (
    <div
      className={`
        glass rounded-2xl p-6
        ${glow ? 'shadow-glow-violet' : 'shadow-glass'}
        ${hover ? 'glass-hover cursor-pointer' : ''}
        ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  )
}
