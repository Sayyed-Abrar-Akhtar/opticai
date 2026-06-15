import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OpticAI — See Your Future',
  description: 'AI-powered eyewear recommendation. Scan your face, find your perfect frames.',
  themeColor: '#080C17',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'OpticAI — See Your Future',
    description: 'AI-powered eyewear recommendation',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-bg-primary font-body text-text-primary antialiased">
        {children}
      </body>
    </html>
  )
}
