'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SignOutPage() {
  const router = useRouter()
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="max-w-md w-full p-8 pt-10 space-y-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign out</h1>
        <p className="mb-6">Are you sure you want to sign out?</p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => router.back()} type="button">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => signOut({ callbackUrl: '/' })}
            type="button"
          >
            Sign out
          </Button>
        </div>
      </Card>
    </div>
  )
}
