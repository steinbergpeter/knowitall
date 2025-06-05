import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSession } from 'next-auth/react'
import { useCreateProject } from '@/server-state/mutations/useCreateProject'
import { type CreatedProject } from '@/validations/project'

export function ProjectCreateForm({
  onCreated,
}: {
  onCreated?: (project: CreatedProject) => void
}) {
  const { data: session, status } = useSession()
  const [values, setValues] = useState({
    name: '',
    description: '',
    password: '',
  })

  const mutation = useCreateProject((project) => {
    onCreated?.(project)
    setValues({ name: '', description: '', password: '' })
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(values) // Do not send isPublic
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
      {mutation.error && (
        <div className="text-red-500 text-sm">{mutation.error.message}</div>
      )}
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Project'}
      </Button>
    </form>
  )
}
