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
  const res = await fetch('/api/document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
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
