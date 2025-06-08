import type { AIMessage, ResearchQueryInput } from '@/validations/queries'
import { AIMessageSchema } from '@/validations/queries'
import { useMutation } from '@tanstack/react-query'

// Standalone mutationFn for submitting a research query
export async function submitResearchQuery({
  projectId,
  prompt,
  chatId,
}: ResearchQueryInput): Promise<AIMessage & { chatId?: string }> {
  const res = await fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, prompt, chatId }),
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

  // If the backend returns a chatId, include it in the return value
  return { ...aiData, chatId: data.chatId }
}

// React Query mutation hook
export function useResearchMutation(options = {}) {
  return useMutation<AIMessage, Error, ResearchQueryInput>({
    mutationFn: submitResearchQuery,
    ...options,
  })
}
