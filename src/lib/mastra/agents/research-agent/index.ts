import { GraphSchema, type Graph } from '@/validations/research'
import { openai } from '@ai-sdk/openai'
import { Agent } from '@mastra/core/agent'
import { graphQueryTool } from '../../tools/graph-query'
import { webSearchTool } from '../../tools/web-search'
import { agentPrompt } from './agent-prompt'
import { extractAndValidateGraph } from './extract-and-validate-graph'
import { extractWebSearchResults } from './extract-web-search-results'
import { formatWebLinksForChecklist } from './format-web-links-for-checklist'
import { persistGraph } from './persist-graph'
import { processWebSearchResults } from './process-web-search-results'

const now = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })

export const researchAgent = new Agent({
  name: 'ResearchAgent',
  instructions: agentPrompt(now),
  model: openai('gpt-4o'),
  tools: { webSearch: webSearchTool, graphQuery: graphQueryTool },
})

// Main workflow: accepts chat history, returns AI response and structured data
export async function runResearchAgent(
  messages: { role: 'user' | 'assistant'; content: string }[],
  options?: {
    projectId?: string
    documentId?: string
    userId?: string
    documentContext?: Record<string, unknown> // Optional document metadata/context
  }
) {
  // If documentContext is provided, prepend it to the user message for richer extraction
  let enrichedMessages = messages
  if (options?.documentContext && messages.length > 0) {
    const docMetaString =
      'Document context (metadata): ' +
      JSON.stringify(options.documentContext) +
      '\n\n'
    enrichedMessages = [
      {
        role: 'user',
        content: docMetaString + messages[0].content,
      },
      ...messages.slice(1),
    ]
  }

  const aiResult = await researchAgent.generate(enrichedMessages)
  const aiText = aiResult.text || ''

  // Use helper to extract web search results
  const webSearchResults = extractWebSearchResults(
    aiResult as unknown as Record<string, unknown>
  )

  // If web search results exist, return them to the user for approval instead of auto-saving
  if (webSearchResults.length > 0) {
    // Use helper to format for checklist UI
    const webLinks = formatWebLinksForChecklist(webSearchResults)
    // Format recommendations as markdown links, each on a new line, with only the link clickable
    const recommendations = webLinks
      .map(
        (link) =>
          `- [${link.title || link.url}](${link.url})${link.summary ? ' — ' + link.summary : ''}`
      )
      .join('\n')
    return {
      text:
        'Here are some websites where you can learn more online:\n\n' +
        recommendations +
        '\n\nPlease select which you want to add to your knowledge graph.',
      webLinks, // structured for checklist UI
      awaitingUserApproval: true,
    }
  }

  let graph: Graph = { nodes: [], edges: [], summaries: [] }
  let validated: ReturnType<typeof GraphSchema.safeParse> | undefined
  const extracted = extractAndValidateGraph(aiText, graph.summaries)
  graph = extracted.graph
  validated = extracted.validated

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
  const extracted2 = extractAndValidateGraph(aiText, graph.summaries)
  graph = extracted2.graph
  validated = extracted2.validated

  // If documentId is provided, tag all graph elements with it
  if (options?.documentId) {
    for (const node of graph.nodes) node.documentId = options.documentId
    for (const edge of graph.edges) edge.documentId = options.documentId
    for (const summary of graph.summaries)
      summary.documentId = options.documentId
  }

  // Store results in PostgreSQL via Prisma if validated or if any graph data exists
  const hasGraphData =
    graph.nodes.length > 0 ||
    graph.edges.length > 0 ||
    graph.summaries.length > 0
  if ((validated?.success || hasGraphData) && options?.projectId) {
    const { projectId } = options
    await persistGraph(graph, projectId)
  }

  return {
    text: aiText,
    graph,
    validated,
    webSearchResults,
  }
}
