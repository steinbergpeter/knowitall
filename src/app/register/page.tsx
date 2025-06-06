import { AuthShell } from '@/components/auth-shell'
import { RegisterForm } from '@/components/register-form'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <AuthShell
        title="Create an Account"
        oauthLabel="Sign up with Google"
        switchText="Already have an account?"
        switchHref="/signin"
      >
        <RegisterForm />
      </AuthShell>
    </div>
  )
}
