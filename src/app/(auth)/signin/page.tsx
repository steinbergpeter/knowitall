import { AuthShell } from '@/components/auth-shell'
import { SignInForm } from '@/components/signin-form'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <AuthShell
        title="Sign in to existing account"
        oauthLabel="Sign in with Google"
        switchText="Here for the first time?"
        switchHref="/register"
      >
        <SignInForm />
      </AuthShell>
    </div>
  )
}
