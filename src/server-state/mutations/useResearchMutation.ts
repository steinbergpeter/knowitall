import type { AIMessage, ResearchQueryInput } from '@/validations/queries'
import { AIMessageSchema } from '@/validations/queries'
import { useMutation } from '@tanstack/react-query'

// Standalone mutationFn for submitting a research query
export async function submitResearchQuery({
  projectId,
  prompt,
}: ResearchQueryInput): Promise<AIMessage> {
  const res = await fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, prompt }),
  })
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit research query')
  }
  const { success, data: aiData, error } = AIMessageSchema.safeParse(data)
  if (!success) {
    throw new Error(`Invalid response format: ${error.message}`)
  }

  const content = `This simulates a response to your query: "${prompt}"`

  aiData.content = content

  return aiData
}

// React Query mutation hook
export function useResearchMutation(options = {}) {
  return useMutation<AIMessage, Error, ResearchQueryInput>({
    mutationFn: submitResearchQuery,
    ...options,
  })
}
