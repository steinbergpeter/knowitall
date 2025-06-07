'use client'

import { Button } from '@/components/ui/button'
import { useResearchMutation } from '@/server-state/mutations/useResearchMutation'
import { useState } from 'react'

interface QueryPanelProps {
  projectId: string
}

export default function QueryPanel({ projectId }: QueryPanelProps) {
  const [queryInput, setQueryInput] = useState('')
  const [chatHistory, setChatHistory] = useState<
    {
      query: string | null
      aiResponse: string | null
      error?: string
    }[]
  >([
    {
      query: null,
      aiResponse:
        '👋 Welcome! This is your project research assistant. Ask any research question about your project, and I’ll answer or help you explore your knowledge graph. Try: "What are the main findings about X?" or "Summarize the key documents."',
    },
  ])
  const { mutate: submitQuery, isPending: isSubmittingQuery } =
    useResearchMutation({
      onSuccess: (
        data: { aiResponse: string },
        variables: { projectId: string; query: string }
      ) => {
        setChatHistory((prev) => [
          ...prev,
          { query: variables.query, aiResponse: data.aiResponse },
        ])
        setQueryInput('')
      },
      onError: (
        error: unknown,
        variables: { projectId: string; query: string }
      ) => {
        setChatHistory((prev) => [
          ...prev,
          {
            query: variables.query,
            aiResponse: null,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        ])
      },
    })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitQuery({ projectId, prompt: queryInput })
  }

  return (
    <div className="mx-auto py-2 flex flex-col items-center gap-6 min-h-[70vh]">
      {/* CHAT HISTORY */}
      <div className="w-full max-w-xl flex-1 flex flex-col gap-6 overflow-y-auto mb-4 border border-gray-300 rounded-lg bg-white shadow-sm p-4">
        {chatHistory.map((item, idx) => (
          <div
            key={idx}
            className="p-4 bg-gray-50 border border-gray-200 rounded-xl"
          >
            {item.query === null ? (
              <div className="text-gray-600 italic">{item.aiResponse}</div>
            ) : (
              <>
                <div className="mb-2">
                  <span className="font-semibold text-blue-700">You:</span>{' '}
                  {item.query}
                </div>
                {item.error && (
                  <div className="text-red-500">Error: {item.error}</div>
                )}
                {item.aiResponse && (
                  <div className="text-green-700">
                    <span className="font-semibold">AI:</span> {item.aiResponse}
                  </div>
                )}
              </>
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
          onChange={(e) => setQueryInput(e.target.value)}
          required
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
