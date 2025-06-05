'use client'
import React from 'react'
import type { ProjectDetail } from '@/validations/project'

export default function ProjectDetailClient({
  project,
  isOwner,
}: {
  project: ProjectDetail
  isOwner: boolean
}) {
  // Placeholder for future detail UI
  return (
    <div className="max-w-2xl w-full bg-white rounded shadow p-6 mt-8">
      <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
      <p className="text-gray-600 mb-2">{project.description}</p>
      <div className="text-sm text-gray-400 mb-2">
        Owner: {project.owner?.name || project.owner?.email || 'Unknown'}
      </div>
      {isOwner && (
        <div className="text-green-600 font-semibold mb-2">
          You are the owner of this project.
        </div>
      )}
      {/* More project details and actions will go here */}
    </div>
  )
}
