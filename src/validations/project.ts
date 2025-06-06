import { z } from 'zod'
import { Project, User } from '@prisma/client'

export const ProjectSchema = z.object({
  name: z.string().trim().min(2, 'Project name is required').max(100),
  description: z.string().trim().max(500).optional(),
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

export const ProjectCountsSchema = z.object({
  queries: z.number(),
  nodes: z.number(),
  edges: z.number(),
  summaries: z.number(),
  documents: z.number(),
})

export const ProjectDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  isPublic: z.boolean(),
  owner: z.object({
    id: z.string(),
    name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
  counts: ProjectCountsSchema, // <-- add counts here
})

export type ProjectCounts = z.infer<typeof ProjectCountsSchema>
export type ProjectDetail = z.infer<typeof ProjectDetailSchema>

type ProjectWithOwnerAndCounts = Project & {
  owner: Pick<User, 'id' | 'name' | 'email'>
  _count: {
    queries: number
    nodes: number
    edges: number
    summaries: number
    documents: number
  }
}
// Helper to transform a Prisma project (with owner and _count) to ProjectDetail
export function toProjectDetail(
  project: ProjectWithOwnerAndCounts
): ProjectDetail {
  return ProjectDetailSchema.parse({
    ...project,
    owner: {
      id: project.owner.id,
      name: project.owner.name,
      email: project.owner.email,
    },
    counts: {
      queries: project._count.queries,
      nodes: project._count.nodes,
      edges: project._count.edges,
      summaries: project._count.summaries,
      documents: project._count.documents,
    },
    createdAt:
      project.createdAt instanceof Date
        ? project.createdAt.toISOString()
        : project.createdAt,
    updatedAt:
      project.updatedAt instanceof Date
        ? project.updatedAt.toISOString()
        : project.updatedAt,
  })
}

export const ProjectDetailApiSchema = z.object({
  project: ProjectDetailSchema,
})

export type ProjectDetailApi = z.infer<typeof ProjectDetailApiSchema>
