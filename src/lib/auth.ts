import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
        })
        // Add password check logic here (e.g., bcrypt)
        if (user /* && password matches */) {
          return user
        }
        return null
      },
    }),
  ],
  session: {
    strategy: 'database',
  },
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return false
      // Remove upsert logic, let PrismaAdapter handle user creation
      return true
    },
    async session({ session }) {
      if (session.user?.email) {
        const internalUser = await prisma.user.findUnique({
          where: { email: session.user.email },
        })
        if (internalUser) {
          session.user.id = internalUser.id
          session.user.role = internalUser.role
        }
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
