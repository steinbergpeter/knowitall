import { useQuery } from '@tanstack/react-query'
import {
  CreatedProjectSchema,
  type CreatedProject,
} from '@/validations/project'

export const useProject = (projectId: string | undefined) =>
  useQuery<CreatedProject, Error>({
    queryKey: ['project', projectId],
    enabled: !!projectId,
    queryFn: () => getProject(projectId),
  })

const getProject = async (
  projectId: string | undefined
): Promise<CreatedProject> => {
  if (!projectId) throw new Error('No projectId provided')
  const res = await fetch(`/api/project/${projectId}`)
  if (!res.ok) throw new Error('Failed to fetch project')
  const data = await res.json()
  return CreatedProjectSchema.parse(data.project)
}
