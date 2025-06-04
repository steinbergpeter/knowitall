import { z } from 'zod'

// Node types: e.g., Person, Organization, Concept, Date, Location, etc.
export const KnowledgeGraphNodeSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(1).max(200),
  type: z.string().trim().max(50),
  metadata: z.record(z.any()).optional(),
  researchQueryId: z.string().optional(),
  provenance: z.string().optional(),
})
export type KnowledgeGraphNode = z.infer<typeof KnowledgeGraphNodeSchema>

// Edge types: e.g., Employment, TypeOf, Influence, etc.
export const KnowledgeGraphEdgeSchema = z.object({
  id: z.string().optional(),
  source: z.string().trim().min(1),
  target: z.string().trim().min(1),
  type: z.string().trim().max(50),
  metadata: z.record(z.any()).optional(),
  researchQueryId: z.string().optional(),
  provenance: z.string().optional(),
})
export type KnowledgeGraphEdge = z.infer<typeof KnowledgeGraphEdgeSchema>

export const SummaryPointSchema = z.object({
  id: z.string().optional(),
  text: z.string().trim().min(1).max(1000),
  researchQueryId: z.string().optional(),
  provenance: z.string().optional(),
})
export type SummaryPoint = z.infer<typeof SummaryPointSchema>

export const ResearchQuerySchema = z.object({
  query: z.string().trim().min(1).max(500),
  documents: z.array(z.string()).optional(),
  projectId: z.string().optional(),
})
export type ResearchQuery = z.infer<typeof ResearchQuerySchema>
