'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

interface ProjectDeleteModalProps {
  open: boolean
  onClose: () => void
  onDelete: (password: string, projectName: string) => Promise<void>
  projectName: string
  isDeleting: boolean
}

const ProjectDeleteModal = ({
  open,
  onClose,
  onDelete,
  projectName,
  isDeleting,
}: ProjectDeleteModalProps) => {
  const [step, setStep] = useState<'warn' | 'confirm'>('warn')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleProceed = () => {
    setStep('confirm')
  }

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await onDelete(password, projectName)
      setPassword('')
      setStep('warn')
      onClose()
    } catch (err) {
      setError((err as Error).message || 'Failed to delete project')
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setStep('warn')
        onClose()
      }}
    >
      <DialogContent>
        <DialogTitle>Delete Project</DialogTitle>
        <div className="space-y-4">
          {step === 'warn' ? (
            <>
              <p className="text-red-600 text-sm">
                Are you sure you want to delete{' '}
                <span className="font-semibold">{projectName}</span>? This
                action <b>cannot be undone</b> and all project data will be
                permanently lost.
              </p>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleProceed}
                >
                  Continue
                </Button>
              </div>
            </>
          ) : (
            <form onSubmit={handleDelete} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter your project password to confirm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('warn')}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Project'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProjectDeleteModal
