import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DocumentSchema,
  type CreatedDocument,
  type DocumentFormValues,
} from '@/validations/document'

const createDocument = async (
  input: DocumentFormValues
): Promise<CreatedDocument> => {
  const parsed = DocumentSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message || 'Invalid input')
  }
  const inputWithSource = {
    ...parsed.data,
    source: parsed.data.source || 'user',
  }
  const res = await fetch('/api/document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputWithSource),
  })
  if (!res.ok) throw new Error('Failed to create document')
  const data = await res.json()
  return data.document as CreatedDocument
}

export const useCreateDocument = (
  onCreated?: (document: CreatedDocument) => void
) => {
  const queryClient = useQueryClient()
  return useMutation<CreatedDocument, Error, DocumentFormValues>({
    mutationFn: createDocument,
    onSuccess: (document) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      onCreated?.(document)
    },
  })
}

export const deleteDocument = async ({
  documentId,
  password,
}: {
  documentId: string
  password: string
}) => {
  const res = await fetch(`/api/document/${documentId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || 'Failed to delete document')
  }
}

export const useDeleteDocument = (projectId: string) => {
  const queryClient = useQueryClient()
  return useMutation<void, Error, { documentId: string; password: string }>({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] })
    },
  })
}
