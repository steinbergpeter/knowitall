import { z } from 'zod'

export const ResearchQuerySchema = z.object({
  projectId: z.string(),
  prompt: z.string(),
})

export type ResearchQueryInput = z.infer<typeof ResearchQuerySchema>

export const KnowledgeGraphSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      type: z.string(),
      metadata: z.any().optional(),
    })
  ),
  edges: z.array(
    z.object({
      source: z.string(),
      target: z.string(),
      type: z.string(),
      metadata: z.any().optional(),
    })
  ),
  summary_points: z.array(z.string()),
})

export type KnowledgeGraphResult = z.infer<typeof KnowledgeGraphSchema>
