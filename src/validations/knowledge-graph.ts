import { z } from 'zod'

// Node types: e.g., Person, Organization, Concept, Date, Location, etc.
export const NodeSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(1).max(200),
  type: z.string().trim().max(50),
  metadata: z.record(z.any()).optional(),
  researchQueryId: z.string().optional(),
  provenance: z.string().optional(),
  documentId: z.string().optional(),
})
export type Node = z.infer<typeof NodeSchema>

// Edge types: e.g., Employment, TypeOf, Influence, etc.
export const EdgeSchema = z.object({
  id: z.string().optional(),
  source: z.string().trim().min(1),
  target: z.string().trim().min(1),
  type: z.string().trim().max(50),
  metadata: z.record(z.any()).optional(),
  researchQueryId: z.string().optional(),
  provenance: z.string().optional(),
  documentId: z.string().optional(),
})
export type Edge = z.infer<typeof EdgeSchema>

export const SummarySchema = z.object({
  id: z.string().optional(),
  text: z.string().trim().min(1).max(1000),
  researchQueryId: z.string().optional(),
  provenance: z.string().optional(),
  documentId: z.string().optional(),
})
export type Summary = z.infer<typeof SummarySchema>

export const QuerySchema = z.object({
  query: z.string().trim().min(1).max(500),
  documents: z.array(z.string()).optional(),
  projectId: z.string().optional(),
})
export type Query = z.infer<typeof QuerySchema>
