import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Trash2, X, LoaderCircle } from 'lucide-react'

interface ProjectDeleteModalProps {
  open: boolean
  onClose: () => void
  onDelete: (password: string, projectName: string) => Promise<void>
  projectName: string
  isDeleting: boolean
}

export default function ProjectDeleteModal({
  open,
  onClose,
  onDelete,
  projectName,
  isDeleting,
}: ProjectDeleteModalProps) {
  const [password, setPassword] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setError(null)
    if (nameInput !== projectName) {
      setError('Project name does not match.')
      return
    }
    if (!password) {
      setError('Password is required.')
      return
    }
    try {
      await onDelete(password, nameInput)
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message || 'Failed to delete project.')
      } else {
        setError('Failed to delete project.')
      }
    }
  }

  const handleClose = () => {
    setPassword('')
    setNameInput('')
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" /> Delete Project
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm text-gray-700 mb-2">
          <p>
            <strong>Warning:</strong> This action is{' '}
            <span className="text-red-600 font-semibold">permanent</span> and
            cannot be undone. All files and documents associated with this
            project will be deleted.
          </p>
          <p className="mt-2">
            To confirm, please enter your project password and type the project
            name (<span className="font-mono">{projectName}</span>).
          </p>
        </div>
        <Input
          type="password"
          placeholder="Project password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-2"
        />
        <Input
          type="text"
          placeholder="Type project name to confirm"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          className="mb-2"
        />
        {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
        <DialogFooter className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleClose}
            disabled={isDeleting}
          >
            <X />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Trash2 />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
