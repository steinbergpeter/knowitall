'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface PasswordModalProps {
  showModal: boolean
  setShowModal: (open: boolean) => void
  onPasswordReset: (newPassword: string) => Promise<void>
  isPublic: boolean
}

const PasswordModal = ({
  showModal,
  setShowModal,
  onPasswordReset,
  isPublic,
}: PasswordModalProps) => {
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await onPasswordReset(newPassword)
      setNewPassword('')
      setShowModal(false)
    } catch (err) {
      setError((err as Error).message || 'Failed to reset password')
    }
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent>
        <DialogTitle>Reset Project Password</DialogTitle>
        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            placeholder={isPublic ? 'Set new password' : 'New password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isPublic ? 'Assign Password' : 'Save Password'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default PasswordModal
