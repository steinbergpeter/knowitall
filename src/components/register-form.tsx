'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function RegisterForm() {
  return (
    <form
      className="space-y-4"
      method="post"
      action="/api/auth/callback/credentials"
    >
      <Input name="name" type="text" placeholder="Name" required />
      <Input name="email" type="email" placeholder="Email" required />
      <Input
        name="password"
        type="password"
        placeholder="Password"
        required
        minLength={8}
      />
      <Button type="submit" className="w-full">
        Sign Up
      </Button>
    </form>
  )
}
