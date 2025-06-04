import React from 'react'
import { AuthShell } from '@/components/auth-shell'
import { RegisterForm } from '@/components/register-form'

export default function RegisterModal() {
  return (
    <AuthShell
      title="Create an Account"
      oauthLabel="Sign up with Google"
      oauthAction="/api/auth/signin/google"
      switchText="Already have an account?"
      switchHref="/signin"
    >
      <RegisterForm />
    </AuthShell>
  )
}
