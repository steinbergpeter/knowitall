import { AuthShell } from '@/components/auth-shell'
import { RegisterForm } from '@/components/register-form'
import { ModalOverlay } from '@/components/modal-overlay'

export default function RegisterModal() {
  return (
    <ModalOverlay>
      <AuthShell
        title="Create an Account"
        oauthLabel="Sign up with Google"
        oauthAction="/api/auth/signin/google"
        switchText="Already have an account?"
        switchHref="/signin"
      >
        <RegisterForm />
      </AuthShell>
    </ModalOverlay>
  )
}
