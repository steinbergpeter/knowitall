import { useState } from 'react'
import { type CreatedProject } from '@/validations/project'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DialogTitle } from '@radix-ui/react-dialog'

type ProjectInListProps = {
  project: CreatedProject
  userId?: string
}
const ProjectInList = ({ project, userId }: ProjectInListProps) => {
  const isOwner = userId && project.ownerId === userId
  const isPrivate = !project.isPublic
  const [showModal, setShowModal] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    if (isPrivate && !isOwner) {
      e.preventDefault()
      setShowModal(true)
    }
    // else, let Link handle navigation
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/project/${project.id}/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        setShowModal(false)
        setPassword('')
        setError(null)
        router.push(`/projects/${project.id}`)
      } else {
        const data = await res.json()
        setError(data.error || 'Incorrect password')
      }
    } catch (err) {
      console.error('Error accessing private project:', err)
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <li key={project.id} className="border rounded p-3 flex flex-col bg-card">
        <Link
          href={`/projects/${project.id}`}
          className={`font-semibold text-lg hover:underline ${
            isPrivate && !isOwner ? 'text-orange-600' : 'text-blue-600'
          }`}
          onClick={handleClick}
        >
          {project.name}
        </Link>
        <span className="text-sm text-muted-foreground">
          {project.description}
        </span>
        <span className="text-xs text-gray-400">
          {project.isPublic ? 'Public' : 'Private'}
        </span>
      </li>
      {showModal && (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <DialogTitle className="font-semibold">
                Enter password for this project
              </DialogTitle>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoFocus
                required
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
                <Button type="submit" disabled={loading}>
                  {loading ? 'Checking...' : 'Access Project'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export default ProjectInList
