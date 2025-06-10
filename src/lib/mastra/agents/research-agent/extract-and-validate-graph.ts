import { GraphSchema, type Graph } from '@/validations/research'

/**
 * Extracts, parses, and validates a graph from AI output text, merging with web summaries and handling fallbacks.
 * @param aiText The AI output text (may contain JSON graph)
 * @param webSummaries Array of summaries from web search results
 * @returns { graph: Graph, validated: ReturnType<typeof GraphSchema.safeParse> }
 */
export function extractAndValidateGraph(
  aiText: string,
  webSummaries: Array<{ text: string; provenance?: string }>
): {
  graph: Graph
  validated: ReturnType<typeof GraphSchema.safeParse> | undefined
} {
  let graph: Graph = { nodes: [], edges: [], summaries: [...webSummaries] }
  let validated: ReturnType<typeof GraphSchema.safeParse> | undefined

  const jsonMatch = aiText.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      const validatedGraph = GraphSchema.safeParse(parsed)
      if (validatedGraph.success) {
        graph.nodes.push(...validatedGraph.data.nodes)
        graph.edges.push(...validatedGraph.data.edges)
        // Merge summaries, avoiding duplicates based on text and provenance
        const existingSummaries = new Set(
          graph.summaries.map((s) => `${s.provenance}::${s.text}`)
        )
        for (const summary of validatedGraph.data.summaries) {
          if (
            !existingSummaries.has(`${summary.provenance}::${summary.text}`)
          ) {
            graph.summaries.push(summary)
          }
        }
        validated = GraphSchema.safeParse(graph)
        if (validated.success) {
          graph = validated.data
        } else {
          // If merged graph is invalid, try to use only the LLM's graph or only web summaries
          const llmOnlyGraph = GraphSchema.safeParse(parsed)
          if (llmOnlyGraph.success) {
            graph = llmOnlyGraph.data
            validated = llmOnlyGraph
          } else {
            // Fallback to only web-derived summaries if they exist and form a valid graph part
            const webOnlyGraphPart = {
              nodes: [],
              edges: [],
              summaries: graph.summaries.filter((s) =>
                s.provenance?.startsWith('http')
              ),
            }
            const validatedWebOnly = GraphSchema.safeParse(webOnlyGraphPart)
            if (
              validatedWebOnly.success &&
              webOnlyGraphPart.summaries.length > 0
            ) {
              graph = validatedWebOnly.data
              validated = validatedWebOnly
            } else {
              graph = { nodes: [], edges: [], summaries: [] }
              validated = undefined
            }
          }
        }
      } else if (graph.summaries.length > 0) {
        // LLM output not a valid graph, but we have web summaries
        validated = GraphSchema.safeParse({
          nodes: [],
          edges: [],
          summaries: graph.summaries,
        })
        if (validated.success) {
          graph = validated.data
        } else {
          graph = { nodes: [], edges: [], summaries: [] }
          validated = undefined
        }
      }
    } catch (e) {
      // Fallback if JSON parsing fails but we have web summaries
      console.error('Failed to parse JSON from AI output:', e)
      if (graph.summaries.length > 0) {
        validated = GraphSchema.safeParse({
          nodes: [],
          edges: [],
          summaries: graph.summaries,
        })
        if (validated.success) {
          graph = validated.data
        } else {
          graph = { nodes: [], edges: [], summaries: [] }
          validated = undefined
        }
      } else {
        graph = { nodes: [], edges: [], summaries: [] }
        validated = undefined
      }
    }
  } else if (graph.summaries.length > 0) {
    // No JSON from LLM, but we have web summaries
    validated = GraphSchema.safeParse({
      nodes: [],
      edges: [],
      summaries: graph.summaries,
    })
    if (validated.success) {
      graph = validated.data
    } else {
      graph = { nodes: [], edges: [], summaries: [] }
      validated = undefined
    }
  }

  return { graph, validated }
}
