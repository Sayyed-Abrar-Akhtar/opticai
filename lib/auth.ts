import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { getDb } from './mongodb'
import { createHash } from 'crypto'

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const db = await getDb()
          const user = await db.collection('admin_users').findOne({
            email: credentials.email as string,
          })
          if (!user) return null
          const hash = hashPassword(credentials.password as string)
          if (hash !== user.passwordHash) return null
          return { id: user._id.toString(), email: user.email, role: user.role }
        } catch {
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role
      return token
    },
    async session({ session, token }) {
      if (session.user) (session.user as { role?: unknown }).role = token.role
      return session
    },
  },
  session: { strategy: 'jwt' },
})
