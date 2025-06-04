import { z } from 'zod'

export const ProjectSchema = z.object({
  name: z.string().trim().min(2, 'Project name is required').max(100),
  description: z.string().trim().max(500).optional(),
  isPublic: z.boolean().optional(),
  password: z.string().trim().max(100).optional(),
})

export type ProjectFormValues = z.infer<typeof ProjectSchema>

export const CreatedProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional().default(null),
  isPublic: z.boolean().default(false),
  passwordHash: z.string().nullable().optional().default(null),
  ownerId: z.string(),
  createdAt: z.string(), // ISO date string
  updatedAt: z.string(), // ISO date string
})

export type CreatedProject = z.infer<typeof CreatedProjectSchema>
