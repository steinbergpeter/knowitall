'use client'

import { useState } from 'react'
import { ProjectCreateForm } from '@/app/projects/_components/project-create-form'
import { useProjects } from '@/server-state/queries/useProjects'
import ProjectInList from '@/app/projects/_components/project-in-list'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ProjectsClient() {
  const { data: projects, isLoading, error, refetch } = useProjects()
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'New Project'}
        </Button>
      </div>
      {showForm && (
        <Card className="mb-6 p-4">
          <ProjectCreateForm
            onCreated={() => {
              setShowForm(false)
              refetch()
            }}
          />
        </Card>
      )}
      {isLoading ? (
        <div>Loading projects...</div>
      ) : error ? (
        <div className="text-red-500">{error.message}</div>
      ) : (
        <div className="space-y-4">
          {projects && projects.length > 0 ? (
            projects.map((project) => (
              <ProjectInList key={project.id} project={project} />
            ))
          ) : (
            <div className="text-gray-500">No projects found.</div>
          )}
        </div>
      )}
    </div>
  )
}
