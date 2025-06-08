import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ChatInput } from '@/validations/chat'
import type { ChatWithMessages } from '@/validations/message'

// Create a new chat
export async function createChat(input: ChatInput): Promise<ChatWithMessages> {
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
  return useMutation<ChatWithMessages, Error, ChatInput>({
    mutationFn: createChat,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chats', data.projectId] })
      queryClient.invalidateQueries({ queryKey: ['chatWithMessages', data.id] })
    },
    ...options,
  })
}

// Update a chat (e.g., rename title)
export async function updateChatTitle({
  chatId,
  title,
}: {
  chatId: string
  title: string
}): Promise<ChatWithMessages> {
  const res = await fetch(`/api/chat/${chatId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error('Failed to update chat title')
  return res.json()
}

export function useUpdateChatTitle(options = {}) {
  const queryClient = useQueryClient()
  return useMutation<
    ChatWithMessages,
    Error,
    { chatId: string; title: string }
  >({
    mutationFn: updateChatTitle,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chats', data.projectId] })
      queryClient.invalidateQueries({ queryKey: ['chatWithMessages', data.id] })
    },
    ...options,
  })
}

// Delete a chat
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
    onSuccess: (_data, chatId) => {
      // Invalidate chat list and chat detail queries
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      queryClient.invalidateQueries({ queryKey: ['chatWithMessages', chatId] })
    },
    ...options,
  })
}
