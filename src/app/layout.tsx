import type { Metadata } from 'next'
import '@/styles/globals.css'
import { geistSans, geistMono } from '@/styles/fonts'
import Providers from '@/providers'
import { Header } from '@/components/header'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const metadata: Metadata = {
  title: {
    default: 'KnowItAll | Home',
    template: 'KnowItAll | %s',
  },
  description:
    'Create a project, upload your documents, and let AI build a knowledge graph for you.',
}

export default async function RootLayout({
  children,
  modals,
}: Readonly<{
  children: React.ReactNode
  modals: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Header user={await getUser()} />
          {children}
          {modals}
        </Providers>
      </body>
    </html>
  )
}

const getUser = async () => {
  const session = await getServerSession(authOptions)
  return session?.user
    ? {
        name: session.user.name ?? undefined,
        email: session.user.email ?? undefined,
        image: session.user.image ?? undefined,
      }
    : undefined
}
