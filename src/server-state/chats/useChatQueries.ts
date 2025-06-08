import { useQuery } from '@tanstack/react-query'
import type { ChatListItem } from '@/validations/chat'
import type { ChatWithMessages } from '@/validations/message'

// Fetch all chats for a project (metadata only, no messages)
export async function fetchChatList(
  projectId: string
): Promise<ChatListItem[]> {
  const res = await fetch(
    `/api/chat?projectId=${encodeURIComponent(projectId)}`
  )
  if (!res.ok) throw new Error('Failed to fetch chats')
  const data = await res.json()
  // Expecting { chats: [...] }
  return Array.isArray(data) ? data : data.chats
}

export function useChatList(projectId: string, options = {}) {
  return useQuery<ChatListItem[]>({
    queryKey: ['chats', projectId],
    queryFn: () => fetchChatList(projectId),
    enabled: !!projectId,
    ...options,
  })
}

// Fetch a single chat with all messages
export async function fetchChatWithMessages(
  chatId: string
): Promise<ChatWithMessages> {
  const res = await fetch(`/api/chat/${chatId}`)
  if (!res.ok) throw new Error('Failed to fetch chat')
  return res.json()
}

export function useChatWithMessages(chatId: string, options = {}) {
  return useQuery<ChatWithMessages>({
    queryKey: ['chatWithMessages', chatId],
    queryFn: () => fetchChatWithMessages(chatId),
    enabled: !!chatId,
    ...options,
  })
}
