import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ChatInput, ChatListItem } from '@/validations/chat'

// Abstracted mutationFn for creating a chat
export async function createChat(input: ChatInput): Promise<ChatListItem> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create chat')
  return res.json()
}

export function useCreateChat(options = {}) {
  const queryClient = useQueryClient()
  return useMutation<ChatListItem, Error, ChatInput>({
    mutationFn: createChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
    ...options,
  })
}

// Abstracted mutationFn for deleting a chat
export async function deleteChat(
  chatId: string
): Promise<{ success: boolean }> {
  const res = await fetch(`/api/chat/${chatId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete chat')
  return res.json()
}

export function useDeleteChat(options = {}) {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
    ...options,
  })
}
