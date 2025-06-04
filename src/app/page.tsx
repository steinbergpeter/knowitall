import { Header } from '@/components/header'
import ProjectInList from '@/components/project-in-list'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Project } from '@prisma/client'
import { getServerSession } from 'next-auth'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  let projects: Array<Project> = []

  if (session?.user) {
    projects = await prisma.project.findMany({
      where: {
        OR: [{ isPublic: true }, { ownerId: session.user.id }],
      },
      orderBy: { createdAt: 'desc' },
    })
  } else {
    projects = await prisma.project.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  const user = session?.user
    ? {
        name: session.user.name ?? undefined,
        email: session.user.email ?? undefined,
        image: session.user.image ?? undefined,
      }
    : undefined

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header user={user} />
      <main className="max-w-2xl mx-auto py-10 px-4 w-full flex-1">
        <h1 className="text-3xl font-bold mb-6">KnowItAll Projects</h1>
        <ul className="space-y-2">
          {projects.map((project) => (
            <ProjectInList
              key={project.id}
              project={project}
              userId={session?.user?.id}
            />
          ))}
        </ul>
      </main>
    </div>
  )
}
