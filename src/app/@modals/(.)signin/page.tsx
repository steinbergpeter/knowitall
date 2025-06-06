import { AuthShell } from '@/components/auth-shell'
import { SignInForm } from '@/components/signin-form'
import { ModalOverlay } from '@/components/modal-overlay'

export default function SignInModal() {
  return (
    <ModalOverlay>
      <AuthShell
        title="Sign in to existing account"
        oauthLabel="Sign in with Google"
        switchText="Here for the first time?"
        switchHref="/register"
      >
        <SignInForm />
      </AuthShell>
    </ModalOverlay>
  )
}
