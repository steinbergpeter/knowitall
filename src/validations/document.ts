import { z } from 'zod'

export const DocumentSchema = z.object({
  projectId: z.string().trim(),
  title: z.string().trim().min(1).max(200),
  type: z.string().trim().max(50), // e.g., 'pdf', 'web', 'text'
  url: z.string().url().optional(),
  content: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  source: z.string().optional().default('user'), // add source field
})

export type DocumentFormValues = z.infer<typeof DocumentSchema>

export const CreatedDocumentSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  userId: z.string(),
  title: z.string(),
  type: z.string(), // e.g., 'pdf', 'web', 'text'
  url: z.string().url().optional().nullable().default(null),
  content: z.string().optional().nullable().default(null),
  extractedText: z.string().optional().nullable().default(null),
  metadata: z.record(z.any()).optional().nullable().default(null),
  source: z.string().default('user'), // add source field
  createdAt: z.string(), // ISO date string
  updatedAt: z.string(), // ISO date string
})
export type CreatedDocument = z.infer<typeof CreatedDocumentSchema>

export type DocumentType = 'text' | 'pdf' | 'web'
