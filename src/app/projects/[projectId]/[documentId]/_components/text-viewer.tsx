interface TextViewerProps {
  content?: string | null
}

export default function TextViewer({ content }: TextViewerProps) {
  return (
    <pre className="bg-gray-100 rounded p-4 whitespace-pre-wrap text-sm overflow-x-auto">
      {content}
    </pre>
  )
}
