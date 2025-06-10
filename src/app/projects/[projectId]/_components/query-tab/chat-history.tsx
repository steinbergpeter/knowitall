import type { Message } from '@/validations/message'
import type { AnchorHTMLAttributes } from 'react'
import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

function MarkdownLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline"
    >
      {props.children}
    </a>
  )
}

export default function ChatHistory({
  chatHistory,
}: {
  chatHistory: Message[]
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [chatHistory])

  return (
    <div
      ref={containerRef}
      className="w-full max-w-xl flex flex-col gap-6 mb-4 border border-gray-300 rounded-lg bg-white shadow-sm p-4 h-[36rem] overflow-y-auto"
    >
      {chatHistory.map((item, idx) => (
        <div
          key={idx}
          className={`p-4 bg-gray-50 border border-gray-200 rounded-xl ${
            item.author === 'assistant' ? 'mr-2' : 'ml-2'
          }`}
        >
          {item.author === 'assistant' ? (
            <div className="text-green-700">
              <span className="font-semibold">AI:</span>{' '}
              <ReactMarkdown
                components={{
                  a: MarkdownLink,
                }}
              >
                {item.content}
              </ReactMarkdown>
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
  )
}
