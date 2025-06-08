'use client'

import { useRef, useEffect, useState, type ChangeEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useResearchMutation } from '@/server-state/mutations/useResearchMutation'
import { useChat, useChatList } from '@/server-state/queries/useChatQueries'
import { useCreateChat } from '@/server-state/mutations/useChatMutations'
import type { ChatMessage, ResearchQueryInput } from '@/validations/queries'
import ChatHistory from './chat-history'
import ChatList from './chat-list'
import QueryInputForm from './query-input-form'
import { Button } from '@/components/ui/button'

interface QueryPanelProps {
  projectId: string
}

export default function QueryPanel({ projectId }: QueryPanelProps) {
  const [queryInput, setQueryInput] = useState('')
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>(
    []
  )
  const queryClient = useQueryClient()
  const hasCreatedInitialChat = useRef(false)

  // Fetch chat list
  const { data: chatListData, isLoading: isChatListLoading } =
    useChatList(projectId)
  // Create chat mutation
  const { mutate: createChat, isPending: isCreatingChat } = useCreateChat({
    onSuccess: (chat: { id: string }) => {
      setSelectedChatId(chat.id)
      queryClient.invalidateQueries({ queryKey: ['chats', projectId] })
    },
  })
  const { mutate: submitQuery, isPending: isSubmittingQuery } =
    useResearchMutation({
      onSuccess: (data: {
        aiMessage: ChatMessage & { context?: unknown }
        userQuery: ChatMessage & { chatId: string; queryId: string }
        chatId: string
      }) => {
        // Always update selectedChatId from response
        if (data.chatId && data.chatId !== selectedChatId) {
          setSelectedChatId(data.chatId)
        }
        // Clear optimistic messages when real queries arrive (handled in effect below)
        queryClient.invalidateQueries({ queryKey: ['chat', data.chatId] })
        queryClient.invalidateQueries({ queryKey: ['chats', projectId] })
        queryClient.invalidateQueries({
          queryKey: ['project-detail', projectId],
        })
      },
      onError: () => {
        setOptimisticMessages([])
      },
    })

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

  // Fetch chat history for selected chat
  const { data: chatData, isLoading: isChatLoading } = useChat(
    selectedChatId ?? '',
    { enabled: !!selectedChatId }
  )

  // Clear optimistic messages when real queries arrive
  useEffect(() => {
    if (
      optimisticMessages.length > 0 &&
      chatData &&
      chatData.queries.length > 0
    ) {
      setOptimisticMessages([])
    }
  }, [chatData, optimisticMessages.length])

  // Compose chat history for ChatHistory
  let chatHistory: ChatMessage[] = []
  if (!selectedChatId || isChatListLoading || isCreatingChat) {
    chatHistory = [
      {
        role: 'ai',
        content: 'Loading or creating chat...',
      },
    ]
  } else if (isChatLoading) {
    chatHistory = [{ role: 'ai', content: 'Loading chat history...' }]
  } else if (chatData) {
    if (chatData.queries.length === 0) {
      chatHistory = [
        {
          role: 'ai',
          content:
            '👋 Welcome! This is your project research assistant. Ask any research question about your project, and I’ll answer or help you explore your knowledge graph. Try: "What are the main findings about X?" or "Summarize the key documents."',
        },
      ]
      // If optimistic messages exist, show them under the welcome message
      if (optimisticMessages.length > 0) {
        chatHistory = [...chatHistory, ...optimisticMessages]
      }
    } else {
      // Show all user queries and (if present) AI responses for each
      chatHistory = chatData.queries.flatMap((q, idx) => {
        const items: ChatMessage[] = [{ role: 'user', content: q.queryText }]
        // If this is the last query and optimistic AI message exists, show it
        if (
          idx === chatData.queries.length - 1 &&
          optimisticMessages.length === 1 &&
          optimisticMessages[0].role === 'ai'
        ) {
          items.push(optimisticMessages[0])
        }
        // Optionally, you could fetch and show AI responses from the db if you store them
        return items
      })
      // If optimistic user+AI messages exist (for a new query), append them
      if (
        optimisticMessages.length === 2 &&
        optimisticMessages[0].role === 'user' &&
        optimisticMessages[1].role === 'ai'
      ) {
        chatHistory = [...chatHistory, ...optimisticMessages]
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!queryInput.trim() || !selectedChatId) return
    // Show both user and AI message optimistically
    setOptimisticMessages([
      { role: 'user', content: queryInput },
      { role: 'ai', content: 'Thinking...' },
    ])
    const queryData: ResearchQueryInput = {
      projectId,
      prompt: queryInput,
      chatId: selectedChatId,
    }
    submitQuery(queryData)
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
          isSubmitting={isSubmittingQuery}
          onChange={handleChange}
          onKeyDown={handleTextareaKeyDown}
          onSubmit={handleSubmit}
        />
      </div>
      {/* Right: Chat list */}
      <ChatList
        projectId={projectId}
        selectedChatId={selectedChatId}
        onSelectChat={setSelectedChatId}
      />
    </div>
  )
}
