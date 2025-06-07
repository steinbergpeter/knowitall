import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import React from 'react'
import DocumentUploadForm from './document-upload-form'

interface AddDocumentModalProps {
  showModal: boolean
  setShowModal: (open: boolean) => void
  projectId: string
}

const AddDocumentModal = ({
  showModal,
  setShowModal,
  projectId,
}: AddDocumentModalProps) => {
  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent>
        <DialogTitle>Add Document</DialogTitle>
        <DocumentUploadForm
          projectId={projectId}
          onUploaded={() => setShowModal(false)}
          showCancel={true}
          onCancel={() => setShowModal(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

export default AddDocumentModal
