import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { notFound } from 'next/navigation'
import DocumentViewerClient from './_components/document-viewer-client'

interface DocumentDetailPageProps {
  params: Promise<{ projectId: string; documentId: string }>
}

export default async function DocumentDetailPage({
  params,
}: DocumentDetailPageProps) {
  const { documentId } = await params
  const session = await getServerSession(authOptions)
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { project: true },
  })
  if (!document) return notFound()
  // If the document's project is not public, require authentication and ownership
  if (!document.project.isPublic) {
    if (!session || !session.user || document.userId !== session.user.id) {
      return notFound()
    }
  }
  return (
    <main className="w-full max-w-2xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-2">{document.title}</h1>
      <div className="mb-2 text-gray-600">Type: {document.type}</div>
      {document.url ? (
        <div className="mb-4">
          <a
            href={document.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {document.url}
          </a>
        </div>
      ) : null}
      {document.type === 'web' && document.extractedText && (
        <div className="mb-4">
          <h2 className="font-semibold text-lg mb-1">Scraped Text</h2>
          <pre className="bg-gray-100 rounded p-4 whitespace-pre-wrap text-sm overflow-x-auto max-h-96">
            {document.extractedText}
          </pre>
        </div>
      )}
      <DocumentViewerClient
        document={{
          title: document.title,
          type: document.type,
          url: document.url,
          content: document.content,
          extractedText: document.extractedText,
          createdAt:
            document.createdAt instanceof Date
              ? document.createdAt.toISOString()
              : document.createdAt,
        }}
      />
      <div className="mt-4 text-xs text-gray-400">
        Uploaded: {new Date(document.createdAt).toLocaleString()}
      </div>
    </main>
  )
}
