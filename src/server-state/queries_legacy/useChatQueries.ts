import { useQuery } from '@tanstack/react-query'
import type { ChatListItem } from '@/validations/chat'
import type { ChatWithMessages } from '@/validations/message'
// Abstracted queryFn for fetching all chats for a project
export async function fetchChatList(
  projectId: string
): Promise<ChatListItem[]> {
  const res = await fetch(
    `/api/chat?projectId=${encodeURIComponent(projectId)}`
  )
  if (!res.ok) throw new Error('Failed to fetch chats')
  const data = await res.json()
  // Support both { chats: [...] } and [...] for backward compatibility
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

// Abstracted queryFn for fetching a single chat and its queries
export async function fetchChat(chatId: string): Promise<ChatWithMessages> {
  const res = await fetch(`/api/chat/${chatId}`)
  if (!res.ok) throw new Error('Failed to fetch chat')
  return res.json()
}

export function useChat(chatId: string, options = {}) {
  return useQuery<ChatWithMessages>({
    queryKey: ['chat', chatId],
    queryFn: () => fetchChat(chatId),
    enabled: !!chatId,
    ...options,
  })
}
