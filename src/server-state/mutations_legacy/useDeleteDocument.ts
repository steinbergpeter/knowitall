import { useMutation, useQueryClient } from '@tanstack/react-query'

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
