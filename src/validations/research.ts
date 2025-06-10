import { z } from 'zod'

export const NodeSchema = z.object({
  id: z.string().optional(),
  label: z.string(),
  type: z.string(),
  metadata: z.record(z.any()).optional(), // Prisma: Json? (null or object) → Zod: object | undefined
  provenance: z.string().optional(), // Prisma: String? (null or string) → Zod: string | undefined
  documentId: z.string().optional(), // Prisma: String? (null or string) → Zod: string | undefined
  positionX: z.number().optional(), // Optional X position for the node
  positionY: z.number().optional(), // Optional Y position for the node
  parentNodeId: z.string().optional(), // Optional parent node ID for hierarchical structures
  childNodes: z.array(z.string()).optional(), // Array of child node IDs (optional for frontend convenience)
})

export const EdgeSchema = z.object({
  id: z.string().optional(),
  source: z.string(),
  target: z.string(),
  type: z.string(),
  metadata: z.record(z.any()).optional(),
  provenance: z.string().optional(),
  documentId: z.string().optional(),
})

export const SummarySchema = z.object({
  id: z.string().optional(),
  text: z.string(),
  provenance: z.string().optional(),
  documentId: z.string().optional(),
})

export const GraphSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  summaries: z.array(SummarySchema),
})

// Define input schema for graph queries (simple example: search by node label)
export const GraphQueryInputSchema = z.object({
  projectId: z.string(),
  label: z.string().optional(), // Optionally filter by node label
  type: z.string().optional(), // Optionally filter by node type
})

// Output schema: a Graph
export const GraphQueryOutputSchema = GraphSchema

export type Node = z.infer<typeof NodeSchema>
export type Edge = z.infer<typeof EdgeSchema>
export type Summary = z.infer<typeof SummarySchema>
export type Graph = z.infer<typeof GraphSchema>
export type GraphQueryInput = z.infer<typeof GraphQueryInputSchema>
export type GraphQueryOutput = z.infer<typeof GraphQueryOutputSchema>
