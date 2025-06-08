import { useQuery } from '@tanstack/react-query'
import {
  CreatedProjectSchema,
  type CreatedProject,
  ProjectDetailApiSchema,
  type ProjectDetailApi,
} from '@/validations/project'

export const useProjects = () =>
  useQuery<CreatedProject[], Error>({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

export const getProjects = async (): Promise<CreatedProject[]> => {
  const res = await fetch('/api/project')
  if (!res.ok) throw new Error('Failed to fetch projects')
  const data = await res.json()
  return CreatedProjectSchema.array().parse(data.projects)
}

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
