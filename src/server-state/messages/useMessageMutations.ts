import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { MessageInput, Message } from '@/validations/message'

// Create a new message in a chat
export async function createMessage(input: MessageInput): Promise<Message> {
  const res = await fetch(`/api/chat/${input.chatId}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create message')
  return res.json()
}

export function useCreateMessage(options = {}) {
  const queryClient = useQueryClient()
  return useMutation<Message, Error, MessageInput>({
    mutationFn: createMessage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages', data.chatId] })
      queryClient.invalidateQueries({
        queryKey: ['chatWithMessages', data.chatId],
      })
    },
    ...options,
  })
}
