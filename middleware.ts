import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin') &&
    req.nextUrl.pathname !== '/admin/login'

  if (isAdminRoute && !req.auth) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }
})

export const config = {
  matcher: ['/admin/:path*'],
}
