'use client'

import { useChat } from './useChat'
import ChatHistory from './chat-history'
import ChatList from './chat-list'
import QueryInputForm from './query-input-form'

interface QueryPanelProps {
  projectId: string
}

export default function QueryPanel({ projectId }: QueryPanelProps) {
  const {
    queryInput,
    isSubmittingMessage,
    chatHistory,
    handleMessageSubmit,
    handleMessageKeyDown,
    handleMessageChange,
    selectedChatId,
    handleSelectChat,
    handleNewChat,
    isCreatingChat,
  } = useChat(projectId)

  return (
    <div className="mx-auto py-2 flex flex-row items-start min-h-[70vh] w-full">
      {/* Left: Chat history and input */}
      <div className="flex-1 min-w-0 max-w-2xl flex flex-col items-center">
        <ChatHistory chatHistory={chatHistory} />
        <QueryInputForm
          queryInput={queryInput}
          isSubmitting={isSubmittingMessage}
          onChange={handleMessageChange}
          onKeyDown={handleMessageKeyDown}
          onSubmit={handleMessageSubmit}
        />
      </div>
      {/* Right: Chat list */}
      <ChatList
        projectId={projectId}
        selectedChatId={selectedChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        isCreatingChat={isCreatingChat}
      />
    </div>
  )
}
