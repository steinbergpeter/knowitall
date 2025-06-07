import { KnowledgeGraphResult } from '@/validations/queries'
import { useQuery } from '@tanstack/react-query'

// Standalone queryFn for fetching a research query result by queryId
export async function fetchResearchQuery({
  queryId,
}: {
  queryId: string
}): Promise<KnowledgeGraphResult & { queryId: string }> {
  const res = await fetch(
    `/api/research/query?queryId=${encodeURIComponent(queryId)}`
  )
  if (!res.ok) {
    throw new Error('Failed to fetch research query result')
  }
  const data = await res.json()
  // Optionally validate data shape here
  return data
}

// React Query hook
export function useResearchQuery(queryId: string, options = {}) {
  return useQuery<KnowledgeGraphResult & { queryId: string }>({
    queryKey: ['researchQuery', queryId],
    queryFn: () => fetchResearchQuery({ queryId }),
    enabled: !!queryId,
    ...options,
  })
}
