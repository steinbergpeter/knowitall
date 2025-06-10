import { GraphSchema, type Graph } from '@/validations/research'
import type { WebSearchOutput } from '@/validations/web' // Removed TavilySearchResult
import { openai } from '@ai-sdk/openai'
import { Agent } from '@mastra/core/agent'
import { webSearchTool } from '../../tools/web-search'
import { extractAndValidateGraph } from './extract-and-validate-graph'
import { persistGraph } from './persist-graph'
import { processWebSearchResults } from './process-web-search-results'
import { graphQueryTool } from '../../tools/graph-query'

const now = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })

export const researchAgent = new Agent({
  name: 'ResearchAgent',
  instructions: `You are a research assistant. The current date and time is: ${now}. Analyze user queries and provide structured, helpful responses. If relevant, extract entities, relationships, and summary points. You have access to a web search tool for up-to-date information.\n\nWhen possible, return your answer as a JSON object matching this TypeScript type:\n\ninterface Graph { nodes: Node[]; edges: Edge[]; summaries: Summary[] }\ninterface Node { id?: string; label: string; type: string; metadata?: Record<string, any>; provenance?: string; documentId?: string }\ninterface Edge { id?: string; source: string; target: string; type: string; metadata?: Record<string, any>; provenance?: string; documentId?: string }\ninterface Summary { id?: string; text: string; provenance?: string; documentId?: string }\n\nIf you cannot extract a graph, return { nodes: [], edges: [], summaries: [] } as JSON.`,
  model: openai('gpt-4o'),
  tools: { webSearch: webSearchTool, graphQuery: graphQueryTool },
})

// Main workflow: accepts chat history, returns AI response and structured data
export async function runResearchAgent(
  messages: { role: 'user' | 'assistant'; content: string }[],
  options?: { projectId?: string; documentId?: string; userId?: string } // Added userId to options
) {
  // 1. Analyze the query (intent, entities, keywords, output format)
  // 2. Orchestrate a web search (tool is available to the agent)
  const aiResult = await researchAgent.generate(messages)
  const aiText = aiResult.text || ''

  // Process Web Search Tool Results
  const webSearchResults: WebSearchOutput[] = []
  // Correctly access tool results.
  // Assuming aiResult has a 'toolResults' property based on common patterns.
  // If Mastra Agent provides results differently, this will need adjustment.
  if (aiResult.toolResults && Array.isArray(aiResult.toolResults)) {
    for (const toolResult of aiResult.toolResults) {
      if (toolResult.toolName === 'web-search' && toolResult.result) {
        // Ensure the result conforms to WebSearchOutput before pushing
        // This assumes webSearchTool.execute correctly returns WebSearchOutput
        // or throws an error if validation fails within the tool.
        webSearchResults.push(toolResult.result as WebSearchOutput)
      }
    }
  }

  let graph: Graph = { nodes: [], edges: [], summaries: [] }
  let validated: ReturnType<typeof GraphSchema.safeParse> | undefined
  ;({ graph, validated } = extractAndValidateGraph(aiText, graph.summaries))

  if (webSearchResults.length > 0 && options?.projectId && options?.userId) {
    const { projectId, userId } = options
    const summaries = await processWebSearchResults(
      webSearchResults,
      projectId,
      userId
    )
    graph.summaries.push(...summaries)
  }

  // 3. Try to extract nodes, edges, summaries from JSON in the AI output
  ;({ graph, validated } = extractAndValidateGraph(aiText, graph.summaries))

  // 5. Store results in PostgreSQL via Prisma if validated
  if (validated?.success && options?.projectId) {
    const { projectId } = options
    await persistGraph(graph, projectId)
  }

  return {
    text: aiText,
    graph,
    validated,
    webSearchResults, // Optionally return the raw web search results too
  }
}
