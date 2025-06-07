import React from 'react'

interface UrlViewerProps {
  url?: string | null
  type: string
  extractedText?: string | null
}

const UrlViewer: React.FC<UrlViewerProps> = ({ url, type, extractedText }) => {
  return (
    <>
      {/** URL */}
      {url ? (
        <div className="mb-4">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {url}
          </a>
        </div>
      ) : null}

      {/** SCRAPED CONTENT */}
      {type === 'web' && extractedText && (
        <div className="mb-4">
          <h2 className="font-semibold text-lg mb-1">Scraped Text</h2>
          <pre className="bg-gray-100 rounded p-4 whitespace-pre-wrap text-sm overflow-x-auto max-h-96">
            {extractedText}
          </pre>
        </div>
      )}
    </>
  )
}

export default UrlViewer
