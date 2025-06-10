import prisma from '@/lib/prisma'
import {
  GraphQueryInputSchema,
  GraphQueryOutputSchema,
  type Edge,
  type GraphQueryInput,
  type GraphQueryOutput,
  type Node,
  type Summary,
} from '@/validations/research'
import { createTool } from '@mastra/core/tools'

function cleanNode(n: Record<string, unknown>): Node {
  return {
    id: typeof n.id === 'string' ? n.id : undefined,
    label: String(n.label),
    type: String(n.type),
    metadata:
      n.metadata && typeof n.metadata === 'object'
        ? (n.metadata as Record<string, unknown>)
        : undefined,
    provenance: typeof n.provenance === 'string' ? n.provenance : undefined,
    documentId: typeof n.documentId === 'string' ? n.documentId : undefined,
  }
}

function cleanEdge(e: Record<string, unknown>): Edge {
  return {
    id: typeof e.id === 'string' ? e.id : undefined,
    type: String(e.type),
    source: String(e.source),
    target: String(e.target),
    metadata:
      e.metadata && typeof e.metadata === 'object'
        ? (e.metadata as Record<string, unknown>)
        : undefined,
    provenance: typeof e.provenance === 'string' ? e.provenance : undefined,
    documentId: typeof e.documentId === 'string' ? e.documentId : undefined,
  }
}

function cleanSummary(s: Record<string, unknown>): Summary {
  return {
    id: typeof s.id === 'string' ? s.id : undefined,
    text: String(s.text),
    provenance: typeof s.provenance === 'string' ? s.provenance : undefined,
    documentId: typeof s.documentId === 'string' ? s.documentId : undefined,
  }
}

export async function executeGraphQuery(
  input: GraphQueryInput
): Promise<GraphQueryOutput> {
  const { projectId, label, type } = input
  const nodesRaw = await prisma.node.findMany({
    where: {
      projectId,
      ...(label ? { label: { contains: label, mode: 'insensitive' } } : {}),
      ...(type ? { type } : {}),
    },
  })
  const edgesRaw = await prisma.edge.findMany({ where: { projectId } })
  const summariesRaw = await prisma.summary.findMany({ where: { projectId } })
  const nodes = nodesRaw.map(cleanNode)
  const edges = edgesRaw.map(cleanEdge)
  const summaries = summariesRaw.map(cleanSummary)
  return { nodes, edges, summaries }
}

export const graphQueryTool = createTool({
  id: 'graph-query',
  description:
    'Query the knowledge graph for nodes, edges, and summaries by project and optional filters.',
  inputSchema: GraphQueryInputSchema,
  outputSchema: GraphQueryOutputSchema,
  execute: async ({ context }: { context: GraphQueryInput }) =>
    executeGraphQuery(GraphQueryInputSchema.parse(context)),
})
