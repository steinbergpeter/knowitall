import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { notFound } from 'next/navigation'
import DocumentDeleteTrigger from './_components/document-delete-trigger'
import DocumentViewerClient from './_components/document-viewer-client'
import UrlViewer from './_components/url-viewer'
import ProjectBreadcrumbs from '@/components/project-breadcrumbs'

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
  // Add client-side logic for delete modal
  return (
    <main className="w-full max-w-2xl mx-auto py-12">
      <ProjectBreadcrumbs
        projectId={document.project.id}
        projectName={document.project.name}
        documentTitle={document.title}
      />
      <h1 className="text-2xl font-bold mb-2">{document.title}</h1>
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="text-gray-600">Type: {document.type}</div>
        <DocumentDeleteTrigger
          projectOwnerId={document.project.ownerId}
          projectId={document.project.id}
          documentId={document.id}
        />
      </div>
      <UrlViewer
        url={document.url}
        type={document.type}
        extractedText={document.extractedText}
      />
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
