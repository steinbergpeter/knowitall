import type { WebSearchOutput } from '@/validations/web'

/**
 * Extracts all web search results from the agent output.
 * @param aiResult The result object returned by the agent LLM
 * @returns Array of WebSearchOutput
 */
export function extractWebSearchResults(
  aiResult: Record<string, unknown>
): WebSearchOutput[] {
  const webSearchResults: WebSearchOutput[] = []
  if (aiResult.toolResults && Array.isArray(aiResult.toolResults)) {
    for (const toolResult of aiResult.toolResults as Array<
      Record<string, unknown>
    >) {
      if (toolResult.toolName === 'web-search' && toolResult.result) {
        webSearchResults.push(toolResult.result as WebSearchOutput)
      }
    }
  }
  return webSearchResults
}
