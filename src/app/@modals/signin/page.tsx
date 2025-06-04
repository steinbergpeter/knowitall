import React from 'react'
import { AuthShell } from '@/components/auth-shell'
import { SignInForm } from '@/components/signin-form'

export default function SignInModal() {
  return (
    <AuthShell
      title="Sign in to existing account"
      oauthLabel="Sign in with Google"
      oauthAction="/api/auth/signin/google"
      switchText="Here for the first time?"
      switchHref="/register"
    >
      <SignInForm />
    </AuthShell>
  )
}
