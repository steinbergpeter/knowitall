import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import React from 'react'
import DocumentUploadForm from './document-upload-form'
import { Button } from '@/components/ui/button'

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
        />
        <div className="flex justify-end mt-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddDocumentModal
