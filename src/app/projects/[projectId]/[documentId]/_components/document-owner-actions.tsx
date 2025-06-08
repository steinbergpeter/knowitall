'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DeleteDocumentModal from './document-delete-modal'
import { Trash2 } from 'lucide-react'
import { useDeleteDocument } from '@/server-state/mutations_legacy/useDeleteDocument'
import { Button } from '@/components/ui/button'

interface DocumentOwnerActionsProps {
  projectOwnerId: string
  projectId: string
  documentId: string
}

export default function DocumentOwnerActions({
  projectOwnerId,
  projectId,
  documentId,
}: DocumentOwnerActionsProps) {
  const { data: session } = useSession()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const router = useRouter()
  const isOwner = session?.user?.id === projectOwnerId
  const { mutateAsync: deleteDocument } = useDeleteDocument(projectId)

  const handleDelete = async (password: string) => {
    await deleteDocument({ documentId, password })
    router.push(`/projects/${projectId}`)
  }

  return (
    <>
      {isOwner && (
        <div className="flex justify-end mb-4">
          <Button
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            onClick={() => setShowDeleteModal(true)}
            size="icon"
          >
            <Trash2 />
          </Button>
          <DeleteDocumentModal
            showModal={showDeleteModal}
            setShowModal={setShowDeleteModal}
            onDelete={handleDelete}
          />
        </div>
      )}
    </>
  )
}
