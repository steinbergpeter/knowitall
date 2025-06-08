import { useQuery } from '@tanstack/react-query'
import type { ChatListItem, ChatWithQueries } from '@/validations/chat'

// Abstracted queryFn for fetching all chats for a project
export async function fetchChatList(
  projectId: string
): Promise<{ chats: ChatListItem[] }> {
  const res = await fetch(
    `/api/chat?projectId=${encodeURIComponent(projectId)}`
  )
  if (!res.ok) throw new Error('Failed to fetch chats')
  return res.json()
}

export function useChatList(projectId: string, options = {}) {
  return useQuery<{ chats: ChatListItem[] }>({
    queryKey: ['chats', projectId],
    queryFn: () => fetchChatList(projectId),
    enabled: !!projectId,
    ...options,
  })
}

// Abstracted queryFn for fetching a single chat and its queries
export async function fetchChat(chatId: string): Promise<ChatWithQueries> {
  const res = await fetch(`/api/chat/${chatId}`)
  if (!res.ok) throw new Error('Failed to fetch chat')
  return res.json()
}

export function useChat(chatId: string, options = {}) {
  return useQuery<ChatWithQueries>({
    queryKey: ['chat', chatId],
    queryFn: () => fetchChat(chatId),
    enabled: !!chatId,
    ...options,
  })
}
