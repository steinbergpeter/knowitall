'use client'

import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useProjectDetail } from '@/server-state/queries/useProjectDetail'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import PasswordModal from './password-modal'
import ProjectDocumentsWrapperProps from './project-documents-wrapper'

interface ProjectDetailClientProps {
  projectId: string
}

function ProjectDetailClient({ projectId }: ProjectDetailClientProps) {
  const { data, isLoading, error, refetch } = useProjectDetail(projectId)
  const { data: session } = useSession()
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
    session?.user?.id && data.project.owner?.id === session.user.id
  // If you have userId in props or context, use that instead for reliability

  return (
    <div className="w-full mx-auto rounded shadow p-12 pt-0 ">
      <div className="mb-8">
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
      <Tabs defaultValue="documents" className="w-full">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="queries">Queries</TabsTrigger>
          <TabsTrigger value="graph">Graph</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="documents">
          <ProjectDocumentsWrapperProps projectId={projectId} />
        </TabsContent>
        <TabsContent value="queries">
          <div className="py-8 text-center text-gray-500">Queries Space</div>
        </TabsContent>
        <TabsContent value="graph">
          <div className="py-8 text-center text-gray-500">Graph Space</div>
        </TabsContent>
        <TabsContent value="settings">
          {isOwner && (
            <div className="flex flex-col items-center mt-4">
              <Button
                onClick={handleOpenPasswordModal}
                variant="secondary"
                className="mb-4"
              >
                Password
              </Button>
              <PasswordModal
                showModal={showPasswordModal}
                setShowModal={setShowPasswordModal}
                currentPassword={currentPassword}
                onPasswordReset={handlePasswordReset}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
      {/* More project details and actions will go here */}
    </div>
  )
}

export default ProjectDetailClient
