'use client'

import Link from 'next/link'
import { useDocuments } from '@/server-state/queries_legacy/useDocuments'

function ProjectDocumentList({ projectId }: { projectId: string }) {
  const { data: documents, isLoading, error } = useDocuments(projectId)

  return (
    <div className="mt-8">
      {isLoading ? (
        <div>Loading documents...</div>
      ) : error ? (
        <div className="text-red-500 text-sm">{error.message}</div>
      ) : documents && documents.length > 0 ? (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="border rounded p-2 hover:bg-gray-50 transition"
            >
              <div className="flex flex-col gap-1">
                <Link
                  href={`/projects/${projectId}/${doc.id}`}
                  className="block cursor-pointer"
                >
                  <div className="font-medium">{doc.title}</div>
                  <div className="text-xs text-gray-500">{doc.type}</div>
                </Link>
                {doc.url && (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-xs w-fit"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open Source
                  </a>
                )}
                <div className="text-xs text-gray-400">
                  Uploaded: {new Date(doc.createdAt).toLocaleString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-500 text-sm">No documents yet.</div>
      )}
    </div>
  )
}

export default ProjectDocumentList
