'use client'

import { useDocuments } from '@/server-state/queries/useDocuments'

function ProjectDocumentList({ projectId }: { projectId: string }) {
  const documentsQuery = useDocuments(projectId)
  return (
    <div className="mt-8 bg-green-500">
      <h2 className="text-lg font-semibold mb-2">Project Documents</h2>
      {documentsQuery.isLoading ? (
        <div>Loading documents...</div>
      ) : documentsQuery.error ? (
        <div className="text-red-500 text-sm">
          {documentsQuery.error.message}
        </div>
      ) : documentsQuery.data && documentsQuery.data.length > 0 ? (
        <ul className="space-y-2">
          {documentsQuery.data.map((doc) => (
            <li key={doc.id} className="border rounded p-2">
              <div className="font-medium">{doc.title}</div>
              <div className="text-xs text-gray-500">{doc.type}</div>
              {doc.url && (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-xs"
                >
                  Open Source
                </a>
              )}
              <div className="text-xs text-gray-400">
                Uploaded: {new Date(doc.createdAt).toLocaleString()}
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
