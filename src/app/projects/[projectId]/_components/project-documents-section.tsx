import { useState } from 'react'
import { Button } from '@/components/ui/button'
import ProjectDocumentList from './project-document-list'
import AddDocumentModal from './add-document-modal'

interface ProjectDocumentsSectionProps {
  projectId: string
}

export default function ProjectDocumentsSection({
  projectId,
}: ProjectDocumentsSectionProps) {
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
