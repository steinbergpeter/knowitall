'use client'

import { Button } from '@/components/ui/button'
import {
  useCreateChat,
  useUpdateChatTitle,
} from '@/server-state/chats/useChatMutations'
import {
  useChatList,
  useChatWithMessages,
} from '@/server-state/chats/useChatQueries'
import { useCreateMessage } from '@/server-state/messages/useMessageMutations'
import type {
  Message,
  MessageInput,
  ChatWithMessages,
} from '@/validations/message'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import ChatHistory from './chat-history'
import ChatList from './chat-list'
import QueryInputForm from './query-input-form'

interface QueryPanelProps {
  projectId: string
}

export default function QueryPanel({ projectId }: QueryPanelProps) {
  const [queryInput, setQueryInput] = useState('')
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([])
  const [hasRenamedChat, setHasRenamedChat] = useState(false)
  const queryClient = useQueryClient()
  const hasCreatedInitialChat = useRef(false)

  // Fetch chat list (metadata only)
  const { data: chatListData, isLoading: isChatListLoading } =
    useChatList(projectId)

  // Create chat mutation
  const { mutate: createChat, isPending: isCreatingChat } = useCreateChat({
    onSuccess: (chat: ChatWithMessages) => {
      setSelectedChatId(chat.id)
      queryClient.invalidateQueries({ queryKey: ['chats', projectId] })
    },
  })

  // Create message mutation
  const { mutate: createMessage, isPending: isSubmittingMessage } =
    useCreateMessage({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['chatWithMessages', selectedChatId],
        })
      },
      onError: () => {
        setOptimisticMessages([])
      },
    })

  // Update chat title mutation
  const { mutate: updateChatTitle } = useUpdateChatTitle()

  // On mount or when chat list loads, if no chats exist, create one (only once)
  useEffect(() => {
    if (
      !isChatListLoading &&
      chatListData &&
      chatListData.length === 0 &&
      !hasCreatedInitialChat.current
    ) {
      hasCreatedInitialChat.current = true
      createChat({ projectId, title: 'New Chat' })
    } else if (
      !isChatListLoading &&
      chatListData &&
      chatListData.length > 0 &&
      !selectedChatId
    ) {
      setSelectedChatId(chatListData[0].id)
    }
  }, [isChatListLoading, chatListData, selectedChatId, createChat, projectId])

  // Fetch chat with messages for selected chat
  const { data: chatData, isLoading: isChatLoading } = useChatWithMessages(
    selectedChatId ?? '',
    { enabled: !!selectedChatId }
  )

  // Clear optimistic messages when both user and AI messages are present in real messages
  useEffect(() => {
    if (
      optimisticMessages.length > 0 &&
      chatData &&
      chatData.messages.length > 0
    ) {
      // Check if both the user and AI message for the latest input are present
      const lastUser = optimisticMessages.find((m) => m.author === 'user')
      const lastAI = optimisticMessages.find((m) => m.author === 'ai')
      const hasUser =
        lastUser &&
        chatData.messages.some(
          (m) => m.content === lastUser.content && m.author === 'user'
        )
      const hasAI =
        lastAI &&
        chatData.messages.some(
          (m) => m.author === 'ai' && m.content !== 'Thinking...'
        )
      if (hasUser && hasAI) {
        setOptimisticMessages([])
      }
    }
  }, [chatData, optimisticMessages])

  // Compose chat history for ChatHistory
  let chatHistory: Message[] = []
  if (!selectedChatId || isChatListLoading || isCreatingChat) {
    chatHistory = [
      {
        id: 'ai-loading',
        projectId,
        chatId: selectedChatId ?? '',
        author: 'ai',
        content: 'Loading or creating chat...',
        createdAt: '',
        updatedAt: '',
      },
    ]
  } else if (isChatLoading) {
    chatHistory = [
      {
        id: 'ai-loading',
        projectId,
        chatId: selectedChatId,
        author: 'ai',
        content: 'Loading chat history...',
        createdAt: '',
        updatedAt: '',
      },
    ]
  } else if (chatData) {
    if (chatData.messages.length === 0) {
      chatHistory = [
        {
          id: 'ai-welcome',
          projectId,
          chatId: selectedChatId,
          author: 'ai',
          content:
            '👋 Welcome! This is your project research assistant. Ask any research question about your project, and I’ll answer or help you explore your knowledge graph. Try: "What are the main findings about X?" or "Summarize the key documents."',
          createdAt: '',
          updatedAt: '',
        },
      ]
      if (optimisticMessages.length > 0) {
        chatHistory = [...chatHistory, ...optimisticMessages]
      }
    } else {
      chatHistory = [...chatData.messages]
      if (optimisticMessages.length > 0) {
        chatHistory = [...chatHistory, ...optimisticMessages]
      }
    }
  }

  // Handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!queryInput.trim() || !selectedChatId) return
    // Show both user and AI message optimistically
    setOptimisticMessages([
      {
        id: 'optimistic-user',
        projectId,
        chatId: selectedChatId,
        author: 'user',
        content: queryInput,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'optimistic-ai',
        projectId,
        chatId: selectedChatId,
        author: 'ai',
        content: 'Thinking...',
        createdAt: '',
        updatedAt: '',
      },
    ])
    // If this is the first message in the chat, update the chat title
    if (chatData && chatData.messages.length === 0 && !hasRenamedChat) {
      updateChatTitle({ chatId: selectedChatId, title: queryInput })
      setHasRenamedChat(true)
    }
    const messageInput: MessageInput = {
      projectId,
      chatId: selectedChatId,
      author: 'user',
      content: queryInput,
    }
    createMessage(messageInput)
    setQueryInput('')
  }

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      ;(e.target as HTMLTextAreaElement).form?.dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      )
    }
  }

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setQueryInput(e.target.value)

  // New Chat button handler
  const handleNewChat = () => {
    createChat({ projectId, title: 'New Chat' })
    setHasRenamedChat(false)
  }

  return (
    <div className="mx-auto py-2 flex flex-row items-start gap-8 min-h-[70vh] w-full">
      {/* Left: Chat history and input */}
      <div className="flex-1 min-w-0 max-w-2xl flex flex-col items-center">
        <div className="w-full flex justify-end mb-2">
          <Button
            onClick={handleNewChat}
            disabled={isCreatingChat || isChatListLoading}
          >
            {isCreatingChat ? 'Creating Chat...' : 'New Chat'}
          </Button>
        </div>
        <ChatHistory chatHistory={chatHistory} />
        <QueryInputForm
          queryInput={queryInput}
          isSubmitting={isSubmittingMessage}
          onChange={handleChange}
          onKeyDown={handleTextareaKeyDown}
          onSubmit={handleSubmit}
        />
      </div>
      {/* Right: Chat list */}
      <ChatList
        projectId={projectId}
        selectedChatId={selectedChatId}
        onSelectChat={(id) => {
          setSelectedChatId(id)
          setHasRenamedChat(false)
        }}
      />
    </div>
  )
}
