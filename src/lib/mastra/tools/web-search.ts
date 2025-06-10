import {
  WebSearchOutputSchema,
  WebSearchInputSchema,
  type WebSearchInput,
  type WebSearchOutput,
} from '@/validations/web'
import { createTool } from '@mastra/core/tools'
import { tavily } from '@tavily/core'

const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY })

export const webSearchFn = async (
  input: WebSearchInput
): Promise<WebSearchOutput> => {
  const { query, options } = WebSearchInputSchema.parse(input)
  const res = await tavilyClient.search(query, options ?? {})

  // Define a type for the result item
  type TavilyResult = {
    title?: string
    url?: string
    content?: string
    rawContent?: string
    publishedDate?: string
    score?: number
    [key: string]: unknown
  }

  // Normalize Tavily API response to ensure all required string fields are present
  const normalized = {
    ...res,
    answer: res.answer ?? '',
    results: Array.isArray(res.results)
      ? res.results.map((r: TavilyResult) => ({
          ...r,
          title: r.title ?? '',
          url: r.url ?? '',
          content: r.content ?? '',
          rawContent: r.rawContent ?? '',
          publishedDate: r.publishedDate ?? '',
          score: typeof r.score === 'number' ? r.score : 0,
        }))
      : [],
    images: Array.isArray(res.images) ? res.images : [],
  }

  return WebSearchOutputSchema.parse(normalized)
}

export const webSearchTool = createTool({
  id: 'web-search',
  description: 'enter a query and get web search results',
  inputSchema: WebSearchInputSchema,
  outputSchema: WebSearchOutputSchema,
  execute: ({ context }) => webSearchFn(context),
})
