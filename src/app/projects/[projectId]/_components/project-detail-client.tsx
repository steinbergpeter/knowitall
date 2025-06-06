'use client'

import { Button } from '@/components/ui/button'
import { useProjectDetail } from '@/server-state/queries/useProjectDetail'
import { useState } from 'react'
import AddDocumentModal from './add-document-modal'
import PasswordModal from './password-modal'

interface ProjectDetailClientProps {
  projectId: string
}

function ProjectDetailClient({ projectId }: ProjectDetailClientProps) {
  const { data, isLoading, error, refetch } = useProjectDetail(projectId)
  const [showModal, setShowModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState<string | null>(null)

  // Fetch the current password (for demo: you may want to secure this in production)
  const fetchPassword = async () => {
    const res = await fetch(`/api/project/${projectId}`)
    if (res.ok) {
      const d = await res.json()
      setCurrentPassword(d.project.password || '')
    } else {
      setCurrentPassword('')
    }
  }

  const handleOpenPasswordModal = async () => {
    await fetchPassword()
    setShowPasswordModal(true)
  }

  const handlePasswordReset = async (newPassword: string) => {
    const res = await fetch(`/api/project/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to reset password')
    }
    refetch()
  }

  if (isLoading) {
    return <div className="mt-8">Loading project...</div>
  }
  if (error) {
    return <div className="mt-8 text-red-500">{error.message}</div>
  }
  if (!data) {
    return <div className="mt-8 text-gray-500">Project not found.</div>
  }
  const {
    project: { counts, name, description, owner },
  } = data
  // Determine if current user is owner
  const isOwner =
    data.project.owner?.id ===
    (typeof window !== 'undefined'
      ? window.__NEXT_DATA__?.props?.pageProps?.session?.user?.id
      : undefined)
  // If you have userId in props or context, use that instead for reliability

  return (
    <div className="w-full rounded shadow p-6 flex justify-between">
      <div>
        <h1 className="text-2xl font-bold mb-2">{name}</h1>
        <p className="text-gray-600 mb-2">{description}</p>
        <div className="text-sm text-gray-800 mb-2">
          Owner: {owner?.name || owner?.email || 'Unknown'}
          <div className="flex flex-col gap-1 mt-2 text-gray-500">
            <p>Documents: {counts.documents}</p>
            <p>Summaries: {counts.summaries}</p>
            <p>Queries: {counts.queries}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <Button onClick={() => setShowModal(true)} className="mb-4">
          Add Document
        </Button>
        {isOwner && (
          <Button
            onClick={handleOpenPasswordModal}
            className="mb-4"
            variant="secondary"
          >
            Password
          </Button>
        )}
      </div>
      <AddDocumentModal
        showModal={showModal}
        setShowModal={setShowModal}
        projectId={projectId}
      />
      {isOwner && (
        <PasswordModal
          showModal={showPasswordModal}
          setShowModal={setShowPasswordModal}
          currentPassword={currentPassword}
          onPasswordReset={handlePasswordReset}
        />
      )}
      {/* More project details and actions will go here */}
    </div>
  )
}

export default ProjectDetailClient
