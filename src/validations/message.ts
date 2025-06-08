import { z } from 'zod'

export const MessageAuthorSchema = z.enum(['user', 'ai'])
export type MessageAuthor = z.infer<typeof MessageAuthorSchema>

export const MessageSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  chatId: z.string(),
  author: MessageAuthorSchema,
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Message = z.infer<typeof MessageSchema>

export const MessageInputSchema = z.object({
  projectId: z.string(),
  chatId: z.string(),
  author: MessageAuthorSchema,
  content: z.string(),
})

export type MessageInput = z.infer<typeof MessageInputSchema>

export const ChatWithMessagesSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  createdAt: z.string(),
  messages: z.array(MessageSchema),
})

export type ChatWithMessages = z.infer<typeof ChatWithMessagesSchema>
