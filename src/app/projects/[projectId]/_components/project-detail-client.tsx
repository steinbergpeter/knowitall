'use client'

import React from 'react'
import { useProjectDetail } from '@/server-state/queries/useProjectDetail'

interface ProjectDetailClientProps {
  projectId: string
}

export default function ProjectDetailClient({
  projectId,
}: ProjectDetailClientProps) {
  const { data, isLoading, error } = useProjectDetail(projectId)

  if (isLoading) {
    return <div className="mt-8">Loading project...</div>
  }
  if (error) {
    return <div className="mt-8 text-red-500">{error.message}</div>
  }
  if (!data) {
    return <div className="mt-8 text-gray-500">Project not found.</div>
  }
  const { project } = data
  return (
    <div className="max-w-2xl w-full bg-white rounded shadow p-6 mt-8">
      <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
      <p className="text-gray-600 mb-2">{project.description}</p>
      <div className="text-sm text-gray-400 mb-2">
        Owner: {project.owner?.name || project.owner?.email || 'Unknown'}
      </div>
      {/* More project details and actions will go here */}
    </div>
  )
}
