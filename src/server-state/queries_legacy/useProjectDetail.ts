import { useQuery } from '@tanstack/react-query'
import {
  ProjectDetailApiSchema,
  type ProjectDetailApi,
} from '@/validations/project'

export const useProjectDetail = (projectId: string) =>
  useQuery<ProjectDetailApi, Error>({
    queryKey: ['project-detail', projectId],
    enabled: !!projectId,
    queryFn: () => getProjectDetail(projectId),
  })

const getProjectDetail = async (
  projectId: string
): Promise<ProjectDetailApi> => {
  const res = await fetch(`/api/project/${projectId}`)
  if (!res.ok) throw new Error('Failed to fetch project details')
  const data = await res.json()
  return ProjectDetailApiSchema.parse(data)
}
