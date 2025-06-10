import type { WebSearchOutput } from '@/validations/web'

export interface WebLinkChecklistItem {
  id: string
  url: string
  title: string
  summary: string
}

/**
 * Formats web search results for checklist UI.
 * @param webSearchResults Array of WebSearchOutput
 * @returns Array of checklist items with id, url, title, summary
 */
export function formatWebLinksForChecklist(
  webSearchResults: WebSearchOutput[]
): WebLinkChecklistItem[] {
  return webSearchResults.flatMap((result, resultIdx) =>
    result.results.map((r, i) => ({
      id: `${resultIdx}-${i}`,
      url: r.url,
      title: r.title,
      summary: r.content?.slice(0, 200) || '',
    }))
  )
}
