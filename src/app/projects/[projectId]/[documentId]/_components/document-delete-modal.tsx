'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Trash2, Loader, Undo2 } from 'lucide-react'

interface DocumentDeleteModalProps {
  showModal: boolean
  setShowModal: (open: boolean) => void
  onDelete: (password: string) => Promise<void>
}

const DocumentDeleteModal = ({
  showModal,
  setShowModal,
  onDelete,
}: DocumentDeleteModalProps) => {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      await onDelete(password)
      setShowModal(false)
      setPassword('')
    } catch (err) {
      setError((err as Error).message || 'Failed to delete document')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent>
        <DialogTitle>Delete Document</DialogTitle>
        <div className="text-red-600 mb-2 font-semibold">
          This action cannot be undone. To delete this document, enter the
          project password.
        </div>
        <form onSubmit={handleDelete} className="space-y-4">
          <Input
            type="password"
            placeholder="Project password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              <Undo2 />
            </Button>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading ? <Loader className="animate-spin" /> : <Trash2 />}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default DocumentDeleteModal
