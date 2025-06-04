import { useQuery } from '@tanstack/react-query'
import {
  CreatedProjectSchema,
  type CreatedProject,
} from '@/validations/project'

export const useProjects = (guest: boolean = false) =>
  useQuery<CreatedProject[], Error>({
    queryKey: ['projects', { guest }],
    queryFn: () => getProjects(guest),
  })

const getProjects = async (guest: boolean): Promise<CreatedProject[]> => {
  const url = guest ? '/api/project?guest=true' : '/api/project'
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch projects')
  const data = await res.json()
  return CreatedProjectSchema.array().parse(data.projects)
}
