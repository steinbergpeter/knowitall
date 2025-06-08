import { z } from 'zod'

export const ChatInputSchema = z.object({
  projectId: z.string(),
  title: z.string(),
})

export type ChatInput = z.infer<typeof ChatInputSchema>

export const ChatListItemSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  createdAt: z.string(),
})

export type ChatListItem = z.infer<typeof ChatListItemSchema>
