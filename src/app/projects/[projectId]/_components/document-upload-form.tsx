'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreateDocument } from '@/server-state/mutations/useCreateDocument'
import { DocumentSchema } from '@/validations/document'
import { useState } from 'react'

function getFileType(file: File): 'pdf' | 'text' | 'web' | null {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (file.type === 'application/pdf' || ext === 'pdf') return 'pdf'
  if (
    file.type === 'text/plain' ||
    file.type === 'application/rtf' ||
    ext === 'txt' ||
    ext === 'rtf'
  )
    return 'text'
  return null
}

function DocumentUploadForm({
  projectId,
  onUploaded,
}: {
  projectId: string
  onUploaded?: () => void
}) {
  const [type, setType] = useState<'text' | 'pdf' | 'web' | null>(null)
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
    setType(null)
    setValidationError(null)
    onUploaded?.()
  }

  const { mutate: createDoc, error, isPending } = useCreateDocument(onCreated)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const detectedType = getFileType(file)
    if (!detectedType) {
      setValidationError(
        'Unsupported file type. Only PDF, TXT, and RTF are allowed.'
      )
      setFile(null)
      setType(null)
      setContent('')
      return
    }
    setValidationError(null)
    setFile(file)
    setType(detectedType)
    setTitle((prev) => prev || file.name.replace(/\.[^.]+$/, ''))
    if (detectedType === 'text') {
      const text = await file.text()
      setContent(text)
    } else if (detectedType === 'pdf') {
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      let binary = ''
      for (let i = 0; i < uint8Array.length; i += 0x8000) {
        binary += String.fromCharCode(
          ...Array.from(uint8Array.subarray(i, i + 0x8000))
        )
      }
      setContent('') // clear text content
      setFile(file)
      setType('pdf')
      setContent(btoa(binary))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!type && !url && !content) {
      setValidationError(
        'Please select a file, enter a URL, or type/paste text.'
      )
      return
    }
    let docType = type
    let docContent = content
    if (url) {
      docType = 'web'
      docContent = '' // must be string, not undefined
    }
    const input = {
      projectId,
      title,
      type: docType,
      content:
        docType === 'text'
          ? docContent
          : docType === 'pdf'
            ? docContent
            : undefined,
      url: docType === 'web' ? url : undefined,
    }
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
      <Input
        type="file"
        accept=".txt,.rtf,text/plain,application/rtf,application/pdf"
        className="mt-2"
        onChange={handleFileChange}
      />
      <Input
        type="url"
        placeholder="https://example.com (optional)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      {!file && !url && (
        <Textarea
          name="content"
          placeholder="Paste or type text here"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="max-h-64 overflow-auto"
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

export default DocumentUploadForm
