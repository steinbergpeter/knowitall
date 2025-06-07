import PdfViewer from './pdf-viewer'
import TextViewer from './text-viewer'
import UrlViewer from './url-viewer'

interface DocumentViewerClientProps {
  document: {
    title: string
    type: string
    url?: string | null
    content?: string | null
    extractedText?: string | null
    createdAt: string
  }
}

export default function DocumentViewerClient({
  document,
}: DocumentViewerClientProps) {
  if (document.type === 'pdf' && (document.content || document.extractedText)) {
    return <PdfViewer document={document} />
  }
  if (document.type === 'web' && (document.url || document.extractedText)) {
    return (
      <UrlViewer
        url={document.url}
        type={document.type}
        extractedText={document.extractedText}
      />
    )
  }
  // Fallback for non-PDFs or missing data
  return <TextViewer content={document.content} />
}
