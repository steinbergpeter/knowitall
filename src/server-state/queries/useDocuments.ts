import { useQuery } from '@tanstack/react-query'
import {
  CreatedDocumentSchema,
  type CreatedDocument,
} from '@/validations/document'

export const useDocuments = (projectId: string | undefined) =>
  useQuery<CreatedDocument[], Error>({
    queryKey: ['documents', projectId],
    enabled: !!projectId,
    queryFn: () => getDocuments(projectId),
  })

const getDocuments = async (
  projectId: string | undefined
): Promise<CreatedDocument[]> => {
  if (!projectId) throw new Error('No projectId provided')
  const res = await fetch(`/api/document?projectId=${projectId}`)
  if (!res.ok) throw new Error('Failed to fetch documents')
  const data = await res.json()
  return CreatedDocumentSchema.array().parse(data.documents)
}
