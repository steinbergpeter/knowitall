'use client'

import { Button } from '@/components/ui/button'
import { useDeleteProject } from '@/server-state/projects/useProjectsMutations'
import { useProjectDetail } from '@/server-state/projects/useProjectsQueries'
import { Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import ProjectDocumentsWrapperProps from './documents-tab'
import PasswordModal from './settings-tab/password-modal'
import ProjectDeleteModal from './settings-tab/project-delete-modal'
import ProjectHeader from './project-header'
import QueryPanel from './query-tab'
import type { Tabs } from './types'

interface ProjectDetailClientProps {
  projectId: string
}

function ProjectDetailClient({ projectId }: ProjectDetailClientProps) {
  const { data, isLoading, error, refetch } = useProjectDetail(projectId)
  const { data: session } = useSession()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activeTab, setActiveTab] = useState<Tabs>('queries')
  const onSuccess = () => (window.location.href = '/projects')
  const { mutate: deleteProject, isPending: isDeletingProject } =
    useDeleteProject(onSuccess)

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

  // Fix: Make handleDeleteProject async to match modal's expected signature
  const handleDeleteProject = async (password: string, projectName: string) => {
    await new Promise<void>((resolve, reject) => {
      deleteProject(
        { projectId, password, projectName },
        {
          onSuccess: () => resolve(),
          onError: (err) => reject(err),
        }
      )
    })
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
    project: { counts, name, description, owner, isPublic },
  } = data
  // Determine if current user is owner
  // const isOwner = session?.user?.id && data.project.owner?.id === session.user.id
  // If you have userId in props or context, use that instead for reliability

  // Defensive: ensure types for ProjectHeader props
  const safeDescription = description ?? ''
  const safeOwner = owner
    ? { name: owner.name ?? undefined, email: owner.email ?? undefined }
    : { name: undefined, email: undefined }
  const safeIsOwner = Boolean(
    typeof session?.user?.id === 'string' &&
      data.project.owner?.id === session?.user?.id
  )

  return (
    <div className="w-full mx-auto rounded shadow p-12 pt-0">
      <ProjectHeader
        projectId={projectId}
        name={name}
        description={safeDescription}
        owner={safeOwner}
        isPublic={isPublic}
        counts={counts}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="mt-8">
        {activeTab === 'queries' && <QueryPanel projectId={projectId} />}
        {activeTab === 'documents' && (
          <ProjectDocumentsWrapperProps projectId={projectId} />
        )}
        {activeTab === 'graph' && (
          <div className="py-8 text-center text-gray-500">Graph Space</div>
        )}
        {activeTab === 'settings' && safeIsOwner && (
          <div className="flex flex-col items-center mt-4 gap-4">
            <Button
              onClick={() => setShowPasswordModal(true)}
              variant="secondary"
              className="mb-4"
            >
              {isPublic ? 'Set Password & Make Private' : 'Reset Password'}
            </Button>
            <PasswordModal
              showModal={showPasswordModal}
              setShowModal={setShowPasswordModal}
              onPasswordReset={handlePasswordReset}
              currentPassword={isPublic ? null : 'set'} // just to indicate private/public
            />
            {/* Project Delete Trigger */}
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteModal(true)}
              title="Delete Project"
            >
              <Trash2 />
            </Button>
            <ProjectDeleteModal
              open={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              onDelete={handleDeleteProject}
              projectName={name}
              isDeleting={isDeletingProject}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectDetailClient
