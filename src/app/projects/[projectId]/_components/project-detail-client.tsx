'use client'

import ProjectBreadcrumbs from '@/components/project-breadcrumbs'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDeleteProject } from '@/server-state/mutations/useDeleteProject'
import { useProjectDetail } from '@/server-state/queries/useProjectDetail'
import { Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import PasswordModal from './password-modal'
import ProjectDeleteModal from './project-delete-modal'
import ProjectDocumentsWrapperProps from './project-documents-wrapper'

interface ProjectDetailClientProps {
  projectId: string
}

function ProjectDetailClient({ projectId }: ProjectDetailClientProps) {
  const { data, isLoading, error, refetch } = useProjectDetail(projectId)
  const { data: session } = useSession()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
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
  async function handleDeleteProject(password: string, projectName: string) {
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
  const isOwner =
    session?.user?.id && data.project.owner?.id === session.user.id
  // If you have userId in props or context, use that instead for reliability

  return (
    <div className="w-full mx-auto rounded shadow p-12 pt-0 ">
      <ProjectBreadcrumbs projectId={projectId} projectName={name} />
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{name}</h1>
        <p className="text-gray-600 mb-2">{description}</p>
        <div className="text-sm text-gray-800 mb-2">
          Owner: {owner?.name || owner?.email || 'Unknown'}
          <div className="flex flex-col gap-1 mt-2 text-gray-500">
            <p>Privacy: {isPublic ? 'Public' : 'Private'}</p>
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
            <div className="flex flex-col items-center mt-4 gap-4">
              <Button
                onClick={() => setShowPasswordModal(true)}
                variant="secondary"
                className="mb-4"
              >
                Reset Password
              </Button>
              <PasswordModal
                showModal={showPasswordModal}
                setShowModal={setShowPasswordModal}
                onPasswordReset={handlePasswordReset}
                isPublic={isPublic}
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
        </TabsContent>
      </Tabs>
      {/* More project details and actions will go here */}
    </div>
  )
}

export default ProjectDetailClient
