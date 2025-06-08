// src/validations/queries.ts
import { z } from 'zod'

export const UserMessageSchema = z.object({
  role: z.literal('user'),
  content: z.string(),
  error: z.string().optional(),
})

export type UserMessage = z.infer<typeof UserMessageSchema>

export const AIMessageSchema = z.object({
  role: z.literal('ai'),
  content: z.string(),
  error: z.string().optional(),
})

export type AIMessage = z.infer<typeof AIMessageSchema>

export const ChatMessageSchema = z.union([UserMessageSchema, AIMessageSchema])

export type ChatMessage = z.infer<typeof ChatMessageSchema>

export const ResearchQuerySchema = z.object({
  projectId: z.string(),
  prompt: z.string(),
  chatId: z.string().optional(),
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

export const QuerySchema = z.object({
  projectId: z.string(),
  prompt: z.string(),
  chatId: z.string().optional(),
})

export type QueryInput = z.infer<typeof QuerySchema>
