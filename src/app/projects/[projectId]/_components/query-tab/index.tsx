'use client'

import { useChat } from './useChat'
import ChatHistory from './chat-history'
import ChatList from './chat-list'
import QueryInputForm from './query-input-form'
import { useState } from 'react'

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
    pendingWebLinks,
    awaitingUserApproval,
    handleApproveWebLinks,
  } = useChat(projectId)

  // Checklist state for user selection
  const [checkedIds, setCheckedIds] = useState<string[]>([])

  // If awaiting user approval, render checklist UI instead of input form
  return (
    <div className="mx-auto py-2 flex flex-row items-start min-h-[70vh] w-full">
      {/* Left: Chat history and input or checklist */}
      <div className="flex-1 min-w-0 max-w-2xl flex flex-col items-center">
        <ChatHistory chatHistory={chatHistory} />
        {awaitingUserApproval && pendingWebLinks.length > 0 ? (
          <form
            className="w-full max-w-xl flex flex-col gap-4 mb-24 border p-4 rounded bg-white"
            onSubmit={(e) => {
              e.preventDefault()
              handleApproveWebLinks(checkedIds)
              setCheckedIds([])
            }}
          >
            <label className="font-medium mb-2">
              Select web results to add to your knowledge graph:
            </label>
            <div className="flex flex-col gap-2">
              {pendingWebLinks.map((link) => (
                <label
                  key={link.id}
                  className="flex items-start gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checkedIds.includes(link.id)}
                    onChange={(e) => {
                      setCheckedIds((ids) =>
                        e.target.checked
                          ? [...ids, link.id]
                          : ids.filter((id) => id !== link.id)
                      )
                    }}
                  />
                  <span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline"
                    >
                      {link.title || link.url}
                    </a>
                    <div className="text-xs text-muted-foreground mt-1">
                      {link.summary}
                    </div>
                  </span>
                </label>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                disabled={checkedIds.length === 0}
              >
                Proceed with Checked Sites
              </button>
            </div>
          </form>
        ) : (
          <QueryInputForm
            queryInput={queryInput}
            isSubmitting={isSubmittingMessage}
            onChange={handleMessageChange}
            onKeyDown={handleMessageKeyDown}
            onSubmit={handleMessageSubmit}
          />
        )}
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
