import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreateDocument } from '@/server-state/mutations/useCreateDocument'
import { DocumentSchema } from '@/validations/document'

export function DocumentUploadForm({
  projectId,
  onUploaded,
}: {
  projectId: string
  onUploaded?: () => void
}) {
  type DocumentType = 'text' | 'pdf' | 'web'
  const [type, setType] = useState<DocumentType>('text')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const onCreated = () => {
    setTitle('')
    setContent('')
    setUrl('')
    setFile(null)
    setValidationError(null)
    onUploaded?.()
  }

  const { mutate: createDoc, error, isPending } = useCreateDocument(onCreated)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let pdfContent = content
    if (type === 'pdf' && file) {
      const arrayBuffer = await file.arrayBuffer()
      pdfContent = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    }
    // DRY: Build input object once
    const input = {
      projectId,
      title,
      type,
      content:
        type === 'text' ? content : type === 'pdf' ? pdfContent : undefined,
      url: type === 'web' ? url : undefined,
    }
    // Validate with Zod
    const { success, data, error } = DocumentSchema.safeParse(input)
    if (!success) {
      setValidationError(error.errors[0]?.message || 'Invalid input')
      return
    }
    setValidationError(null)
    createDoc(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="title"
        placeholder="Document title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <div>
        <label>Type: </label>
        <select
          className="border rounded px-2 py-1"
          value={type}
          onChange={(e) => setType(e.target.value as DocumentType)}
        >
          <option value="text">Text</option>
          <option value="pdf">PDF</option>
          <option value="web">Web URL</option>
        </select>
      </div>
      {type === 'text' && (
        <Textarea
          name="content"
          placeholder="Paste or type text here"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
        />
      )}
      {type === 'pdf' && (
        <Input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      )}
      {type === 'web' && (
        <Input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      )}
      {validationError && (
        <div className="text-red-500 text-sm">{validationError}</div>
      )}
      {error && <div className="text-red-500 text-sm">{error.message}</div>}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Uploading...' : 'Upload Document'}
      </Button>
    </form>
  )
}
