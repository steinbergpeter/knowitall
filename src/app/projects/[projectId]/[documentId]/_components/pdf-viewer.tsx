'use client'

import { useState } from 'react'

interface PdfViewerProps {
  document: {
    title: string
    content?: string | null
    extractedText?: string | null
  }
}

export default function PdfViewer({ document }: PdfViewerProps) {
  const [viewMode, setViewMode] = useState<'pdf' | 'text'>('pdf')
  return (
    <div className="mb-4">
      <select
        className="border rounded px-2 py-1 mb-4"
        value={viewMode}
        onChange={(e) => setViewMode(e.target.value as 'pdf' | 'text')}
      >
        <option value="pdf">View as PDF</option>
        <option value="text">View as Text</option>
      </select>
      {viewMode === 'pdf' && document.content && (
        <>
          <iframe
            src={`data:application/pdf;base64,${document.content}`}
            title="PDF Document"
            width="100%"
            height="600px"
            className="border rounded"
            allowFullScreen
          />
          <a
            href={`data:application/pdf;base64,${document.content}`}
            download={
              document.title.endsWith('.pdf')
                ? document.title
                : `${document.title}.pdf`
            }
            className="mt-2 inline-block text-blue-600 underline text-sm"
          >
            Download PDF
          </a>
        </>
      )}
      {viewMode === 'text' && (
        <pre className="bg-gray-100 rounded p-4 whitespace-pre-wrap text-sm overflow-x-auto">
          {document.extractedText || 'No extracted text available.'}
        </pre>
      )}
    </div>
  )
}
