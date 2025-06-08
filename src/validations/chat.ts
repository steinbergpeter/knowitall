import { z } from 'zod'

export const ChatSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1),
})

export type ChatInput = z.infer<typeof ChatSchema>

export const ChatListItemSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  createdAt: z.string(),
})

export type ChatListItem = z.infer<typeof ChatListItemSchema>

export const ChatWithQueriesSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  createdAt: z.string(),
  queries: z.array(
    z.object({
      id: z.string(),
      queryText: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
      // Add more fields as needed from your Query model
    })
  ),
})

export type ChatWithQueries = z.infer<typeof ChatWithQueriesSchema>
