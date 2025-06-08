import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateProject } from '@/server-state/mutations_legacy/useCreateProject'
import { type CreatedProject } from '@/validations/project'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

interface ProjectCreateFormProps {
  onCreated?: (project: CreatedProject) => void
}

export function ProjectCreateForm({ onCreated }: ProjectCreateFormProps) {
  const { data: session, status } = useSession()

  const initialValues = { name: '', description: '', password: '' }

  const [values, setValues] = useState(initialValues)

  const {
    mutate: createProject,
    error,
    isPending,
  } = useCreateProject((project) => {
    onCreated?.(project)
    setValues(initialValues)
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createProject(values) // Do not send isPublic
  }

  if (status === 'loading') return <div>Loading...</div>
  if (!session || !session.user)
    return (
      <div className="text-red-500">
        You must be logged in to create a project.
      </div>
    )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="name"
        placeholder="Project name"
        value={values.name}
        onChange={handleChange}
        required
      />
      <Input
        name="description"
        placeholder="Description (optional)"
        value={values.description || ''}
        onChange={handleChange}
      />
      <Input
        name="password"
        placeholder="Password (optional)"
        value={values.password || ''}
        onChange={handleChange}
        type="password"
      />
      {error && <div className="text-red-500 text-sm">{error.message}</div>}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Project'}
      </Button>
    </form>
  )
}
