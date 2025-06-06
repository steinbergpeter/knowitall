'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Clipboard, Check } from 'lucide-react'

interface PasswordModalProps {
  showModal: boolean
  setShowModal: (open: boolean) => void
  currentPassword: string | null
  onPasswordReset: (newPassword: string) => Promise<void>
}

const PasswordModal = ({
  showModal,
  setShowModal,
  currentPassword,
  onPasswordReset,
}: PasswordModalProps) => {
  const [resetMode, setResetMode] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isPublic = !currentPassword

  const handleCopy = async () => {
    if (currentPassword) {
      await navigator.clipboard.writeText(currentPassword)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 1500)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onPasswordReset(newPassword)
      setResetMode(false)
      setNewPassword('')
      setShowModal(false)
    } catch (err) {
      setError((err as Error).message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent>
        <DialogTitle>Project Password</DialogTitle>
        {!resetMode ? (
          <div className="space-y-4">
            {isPublic ? (
              <>
                <div className="text-gray-600 text-sm mb-2">
                  This project is currently{' '}
                  <span className="font-semibold">public</span>.
                  <br />
                  Would you like to make it private and assign a password?
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setResetMode(true)}
                  >
                    Assign Password
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  value={currentPassword || ''}
                  readOnly
                  className="flex-1"
                  type="text"
                />
                <Button
                  type="button"
                  onClick={handleCopy}
                  disabled={!currentPassword}
                  size="icon"
                >
                  {copySuccess ? <Check /> : <Clipboard />}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setResetMode(true)}
                >
                  Reset Password
                </Button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <Input
              type="password"
              placeholder={isPublic ? 'Set new password' : 'New password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setResetMode(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? isPublic
                    ? 'Assigning...'
                    : 'Saving...'
                  : isPublic
                    ? 'Assign Password'
                    : 'Save Password'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default PasswordModal
