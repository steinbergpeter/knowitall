'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AuthShellProps {
  title: string
  children: ReactNode
  oauthLabel: string
  oauthAction: string
  switchText: string
  switchHref: string
}

export function AuthShell({
  title,
  children,
  oauthLabel,
  oauthAction,
  switchText,
  switchHref,
}: AuthShellProps) {
  const router = useRouter()
  const close = () => router.back()
  return (
    <div className="relative">
      <Button
        variant="ghost"
        aria-label="Close"
        onClick={close}
        className="absolute top-1 right-1 z-50 p-1"
        type="button"
      >
        <X className="w-5 h-5" />
        <span className="sr-only">Close</span>
      </Button>
      <Card className={`max-w-md w-full p-8 pt-10 space-y-6`}>
        <h1 className="text-2xl font-bold text-center">{title}</h1>

        {children}

        <div className="flex items-center gap-2 my-4">
          <div className="flex-1 h-px bg-muted-foreground/20" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-muted-foreground/20" />
        </div>

        <form method="post" action={oauthAction} className="w-full">
          <Button
            type="submit"
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            {/* Google SVG here */}
            {oauthLabel}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          {switchText}{' '}
          <Link href={switchHref} className="underline">
            {switchHref.includes('register') ? 'Sign up' : 'Sign in'}
          </Link>
        </div>
      </Card>
    </div>
  )
}
