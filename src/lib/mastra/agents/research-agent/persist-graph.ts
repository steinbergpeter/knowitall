import prisma from '@/lib/prisma'
import { type Graph } from '@/validations/research'

/**
 * Persists a graph's nodes, edges, and summaries to the database for a given project.
 * @param graph The graph object containing nodes, edges, and summaries
 * @param projectId The project ID to associate with all graph elements
 */
export async function persistGraph(graph: Graph, projectId: string) {
  // Store nodes
  for (const node of graph.nodes) {
    await prisma.node.create({
      data: {
        projectId,
        label: node.label,
        type: node.type,
        metadata: node.metadata ?? {},
        provenance: node.provenance,
      },
    })
  }
  // Store edges
  for (const edge of graph.edges) {
    await prisma.edge.create({
      data: {
        projectId,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        metadata: edge.metadata ?? {},
        provenance: edge.provenance,
      },
    })
  }
  // Store summaries
  for (const summary of graph.summaries) {
    await prisma.summary.create({
      data: {
        projectId,
        text: summary.text,
        provenance: summary.provenance,
      },
    })
  }
}
