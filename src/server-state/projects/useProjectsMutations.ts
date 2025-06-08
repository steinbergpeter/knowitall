import { useQueryClient, useMutation } from '@tanstack/react-query'
import {
  ProjectSchema,
  type ProjectFormValues,
  type CreatedProject,
} from '@/validations/project'

const createProject = async (
  input: ProjectFormValues
): Promise<CreatedProject> => {
  const parsed = ProjectSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message || 'Invalid input')
  }
  const res = await fetch('/api/project', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  })
  if (!res.ok) throw new Error('Failed to create project')
  const data = await res.json()
  return data.project as CreatedProject
}

export const useCreateProject = (
  onCreated?: (project: CreatedProject) => void
) => {
  const queryClient = useQueryClient()
  return useMutation<CreatedProject, Error, ProjectFormValues>({
    mutationFn: createProject,
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      onCreated?.(project)
    },
  })
}

export function useDeleteProject(onSuccess?: () => void) {
  return useMutation({
    mutationFn: async ({
      projectId,
      password,
      projectName,
    }: {
      projectId: string
      password: string
      projectName: string
    }) => {
      const res = await fetch(`/api/project/${projectId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, projectName }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete project')
      }
      return true
    },
    onSuccess,
  })
}
