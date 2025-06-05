import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ProjectDetailClient from './_components/project-detail-client'

export default async function ProjectDetailPage({
  params,
}: {
  params: { projectId: string }
}) {
  const session = await getServerSession(authOptions)
  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
    include: { owner: true },
  })
  if (!project) {
    redirect('/projects')
  }
  const isOwner = session?.user?.id === project.ownerId
  const isPublic = project.isPublic
  // If not public and not owner, show password form
  if (!isPublic && !isOwner) {
    return (
      <main className="flex flex-col items-center justify-start min-h-screen py-12">
        <div className="max-w-md w-full bg-white rounded shadow p-6 mt-8">
          <h2 className="text-xl font-bold mb-4">Private Project</h2>
          <p className="mb-4">
            This project is private. Please enter the password to access it.
          </p>
          {/* Password form will go here (to be implemented) */}
        </div>
      </main>
    )
  }
  // Otherwise, show the project detail client (will handle UI/UX)
  return (
    <main className="flex flex-col items-center justify-start min-h-screen py-12">
      <ProjectDetailClient project={project} isOwner={isOwner} />
    </main>
  )
}
