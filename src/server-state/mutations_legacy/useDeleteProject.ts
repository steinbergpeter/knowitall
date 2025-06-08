import { useMutation } from '@tanstack/react-query'

export function useDeleteProject(onSuccess?: () => void) {
  return useMutation({
    mutationFn: async ({
      projectId,
      password,
      projectName,
    }: {
      projectId: string
      password: string
      projectName: string
    }) => {
      const res = await fetch(`/api/project/${projectId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, projectName }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete project')
      }
      return true
    },
    onSuccess,
  })
}
