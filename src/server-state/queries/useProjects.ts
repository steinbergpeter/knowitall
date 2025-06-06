import { useQuery } from '@tanstack/react-query'
import {
  CreatedProjectSchema,
  type CreatedProject,
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
