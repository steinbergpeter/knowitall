import { useMutation } from '@tanstack/react-query'

// Standalone mutationFn for submitting a research query
export async function submitResearchQuery({
  projectId,
  prompt,
}: {
  projectId: string
  prompt: string
}) {
  const res = await fetch('/api/research/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, prompt }),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || 'Failed to submit research query')
  }
  const data = await res.json()
  // Optionally validate data shape here
  return data
}

// React Query mutation hook
export function useResearchMutation(options = {}) {
  return useMutation({
    mutationFn: submitResearchQuery,
    ...options,
  })
}
