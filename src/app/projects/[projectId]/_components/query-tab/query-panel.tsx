'use client'

import { Button } from '@/components/ui/button'
import { useResearchMutation } from '@/server-state/mutations/useResearchMutation'
import { useState, type ChangeEvent } from 'react'
import type { ChatMessage, ResearchQueryInput } from '@/validations/queries'

interface QueryPanelProps {
  projectId: string
}

export default function QueryPanel({ projectId }: QueryPanelProps) {
  const [queryInput, setQueryInput] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'ai',
      content:
        '👋 Welcome! This is your project research assistant. Ask any research question about your project, and I’ll answer or help you explore your knowledge graph. Try: "What are the main findings about X?" or "Summarize the key documents."',
    },
  ])
  const { mutate: submitQuery, isPending: isSubmittingQuery } =
    useResearchMutation({
      onSuccess: (data: import('@/validations/queries').AIMessage) => {
        setChatHistory((prev) => [
          ...prev,
          { role: data.role, content: data.content },
        ])
        setQueryInput('')
      },
      onError: (error: unknown) => {
        setChatHistory((prev) => [
          ...prev,
          {
            role: 'ai',
            content: '',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        ])
      },
    })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const userMessage: ChatMessage = { role: 'user', content: queryInput }
    setChatHistory((prev) => [...prev, userMessage])
    const queryData: ResearchQueryInput = {
      projectId,
      prompt: queryInput,
    }
    submitQuery(queryData)
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

  return (
    <div className="mx-auto py-2 flex flex-col items-center gap-6 min-h-[70vh]">
      {/* CHAT HISTORY */}
      <div className="w-full max-w-xl flex-1 flex flex-col gap-6 mb-4 border border-gray-300 rounded-lg bg-white shadow-sm p-4 h-96 overflow-y-auto">
        {chatHistory.map((item, idx) => (
          <div
            key={idx}
            className="p-4 bg-gray-50 border border-gray-200 rounded-xl"
          >
            {item.role === 'ai' ? (
              <div className="text-green-700">
                <span className="font-semibold">AI:</span> {item.content}
                {item.error && (
                  <div className="text-red-500">Error: {item.error}</div>
                )}
              </div>
            ) : (
              <div className="mb-2">
                <span className="font-semibold text-blue-700">You:</span>{' '}
                {item.content}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* USER INPUT */}
      <form
        className="w-full max-w-xl flex flex-col gap-4 mb-24"
        onSubmit={handleSubmit}
      >
        <label htmlFor="research-query" className="text-left font-medium">
          Submit a Research Query
        </label>
        <textarea
          id="research-query"
          className="w-full border rounded p-2 min-h-[80px] resize-vertical"
          placeholder="E.g. What are the main findings about X in this project?"
          value={queryInput}
          onChange={handleChange}
          required
          onKeyDown={handleTextareaKeyDown}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmittingQuery}>
            {isSubmittingQuery ? 'Submitting...' : 'Submit Query'}
          </Button>
        </div>
      </form>
      {isSubmittingQuery && <div>Loading results...</div>}
    </div>
  )
}
