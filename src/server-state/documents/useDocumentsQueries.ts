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

export const getDocument = async (
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
