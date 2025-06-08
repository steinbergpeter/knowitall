import { useRef, useEffect } from 'react'
import type { ChatMessage } from '@/validations/queries'

export default function ChatHistory({
  chatHistory,
}: {
  chatHistory: ChatMessage[]
}) {
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  return (
    <div className="w-full max-w-xl flex flex-col gap-6 mb-4 border border-gray-300 rounded-lg bg-white shadow-sm p-4 h-[40rem] overflow-y-auto">
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
      <div ref={chatEndRef} />
    </div>
  )
}
