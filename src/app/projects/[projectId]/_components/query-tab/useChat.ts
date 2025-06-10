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
  ChatWithMessages,
  Message,
  MessageInput,
} from '@/validations/message'
import { useQueryClient } from '@tanstack/react-query'
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react'

export function useChat(projectId: string) {
  const [queryInput, setQueryInput] = useState('')
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([])
  const [hasRenamedChat, setHasRenamedChat] = useState(false)
  const queryClient = useQueryClient()
  const hasCreatedInitialChat = useRef(false)

  // CHAT LOGIC
  // Fetch chat list (metadata only)
  const { data: chatListData, isLoading: isChatListLoading } =
    useChatList(projectId)

  // Fetch chat with messages for selected chat
  const { data: chatData, isLoading: isChatLoading } = useChatWithMessages(
    selectedChatId ?? '',
    { enabled: !!selectedChatId }
  )

  // Create chat mutation
  const { mutate: createChat, isPending: isCreatingChat } = useCreateChat({
    onSuccess: (chat: ChatWithMessages) => {
      setSelectedChatId(chat.id)
      queryClient.invalidateQueries({ queryKey: ['chats', projectId] })
    },
  })

  // Update chat title mutation
  const { mutate: updateChatTitle } = useUpdateChatTitle()

  // On mount or when chat list loads,
  // if no chats exist, create one (only once)
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

  // Compose chat history for ChatHistory
  let chatHistory: Message[] = []
  if (!selectedChatId || isChatListLoading || isCreatingChat) {
    chatHistory = [
      {
        id: 'ai-loading',
        projectId,
        chatId: selectedChatId ?? '',
        author: 'assistant',
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
        author: 'assistant',
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
          author: 'assistant',
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

  // MESSAGE LOGIC
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

  // Clear optimistic messages when both
  // user and AI messages are present in real messages
  useEffect(() => {
    if (
      optimisticMessages.length > 0 &&
      chatData &&
      chatData.messages.length > 0
    ) {
      // Check if both the user and AI message for the latest input are present
      const lastUser = optimisticMessages.find((m) => m.author === 'user')
      const lastAI = optimisticMessages.find((m) => m.author === 'assistant')
      const hasUser =
        lastUser &&
        chatData.messages.some(
          (m) => m.content === lastUser.content && m.author === 'user'
        )
      const hasAI =
        lastAI &&
        chatData.messages.some(
          (m) => m.author === 'assistant' && m.content !== 'Thinking...'
        )
      if (hasUser && hasAI) {
        setOptimisticMessages([])
      }
    }
  }, [chatData, optimisticMessages])

  // CHAT Handlers
  const handleSelectChat = (chatId: string | null) => {
    setSelectedChatId(chatId)
    setHasRenamedChat(false)
  }

  const handleNewChat = () => {
    createChat({ projectId, title: 'New Chat' })
    setHasRenamedChat(false)
  }

  // MESSAGE Handlers
  const handleMessageSubmit = (e: FormEvent) => {
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
        author: 'assistant',
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

  const handleMessageKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      ;(e.target as HTMLTextAreaElement).form?.dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      )
    }
  }

  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setQueryInput(e.target.value)

  return {
    queryInput,
    setQueryInput,
    selectedChatId,
    setSelectedChatId,
    optimisticMessages,
    setOptimisticMessages,
    hasRenamedChat,
    setHasRenamedChat,
    isChatListLoading,
    isCreatingChat,
    isSubmittingMessage,
    chatListData,
    chatData,
    chatHistory,
    handleMessageSubmit,
    handleMessageKeyDown,
    handleMessageChange,
    handleNewChat,
    handleSelectChat,
  }
}
