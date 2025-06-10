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
  return WebSearchOutputSchema.parse(res)
}

export const webSearchTool = createTool({
  id: 'web-search',
  description: 'enter a query and get web search results',
  inputSchema: WebSearchInputSchema,
  outputSchema: WebSearchOutputSchema,
  execute: ({ context }) => webSearchFn(context),
})
