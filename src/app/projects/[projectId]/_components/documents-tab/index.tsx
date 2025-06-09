import { Button } from '@/components/ui/button'
import { useState } from 'react'
import AddDocumentModal from './add-document-modal'
import ProjectDocumentList from './project-document-list'

interface ProjectDocumentsWrapperProps {
  projectId: string
}

export default function ProjectDocumentsWrapper({
  projectId,
}: ProjectDocumentsWrapperProps) {
  const [showAddDocModal, setShowAddDocModal] = useState(false)

  return (
    <div className="w-full mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Project Documents</h2>
        <Button onClick={() => setShowAddDocModal(true)}>Add Document</Button>
      </div>
      <ProjectDocumentList projectId={projectId} />
      <AddDocumentModal
        showModal={showAddDocModal}
        setShowModal={setShowAddDocModal}
        projectId={projectId}
      />
    </div>
  )
}
