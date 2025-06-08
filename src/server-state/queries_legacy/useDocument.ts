import { useQuery } from '@tanstack/react-query'
import {
  CreatedDocumentSchema,
  type CreatedDocument,
} from '@/validations/document'

const getDocument = async (
  documentId: string | undefined,
  baseUrl?: string
): Promise<CreatedDocument> => {
  if (!documentId) throw new Error('No documentId provided')
  const url = baseUrl
    ? `${baseUrl}/api/document/${documentId}`
    : `/api/document/${documentId}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch document')
  const data = await res.json()
  return CreatedDocumentSchema.parse(data.document)
}

export const useDocument = (documentId: string | undefined) =>
  useQuery<CreatedDocument, Error>({
    queryKey: ['document', documentId],
    enabled: !!documentId,
    queryFn: () => getDocument(documentId),
  })

export { getDocument }
