import { authOptions } from '@/lib/auth'
import { verifyPassword } from '@/lib/password'
import prisma from '@/lib/prisma'
import { toProjectDetail } from '@/validations/project'
import { getServerSession } from 'next-auth/next'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { hashPassword } from '@/lib/password'
interface Context {
  params: Promise<{ projectId: string }>
}

export async function GET(_req: NextRequest, context: Context) {
  const { projectId } = await context.params
  if (!projectId) {
    return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
  }
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: true,
      _count: {
        select: {
          queries: true,
          nodes: true,
          edges: true,
          summaries: true,
          documents: true,
        },
      },
    },
  })
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }
  // Allow access if public or owner; otherwise, check for valid cookie
  const session = await getServerSession(authOptions)
  const isOwner = session?.user?.id === project.ownerId
  if (!project.isPublic && !isOwner) {
    // Check for project access cookie
    const cookieStore = await cookies()
    const cookieKey = `project_access_${project.id}`
    const cookiePassword = cookieStore.get(cookieKey)?.value
    if (!cookiePassword || !project.passwordHash) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Validate password from cookie
    const valid = await verifyPassword(cookiePassword, project.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  // Return project detail in correct shape
  const projectDetail = toProjectDetail(project)
  return NextResponse.json({ project: projectDetail })
}

export async function PATCH(req: NextRequest, context: Context) {
  const { projectId } = await context.params

  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  if (project.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()

  const { password } = body

  if (!password || typeof password !== 'string' || password.length < 1) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 })
  }
  const passwordHash = await hashPassword(password)

  await prisma.project.update({
    where: { id: projectId },
    data: { passwordHash, isPublic: false },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, context: Context) {
  const { projectId } = await context.params
  const session = await getServerSession(authOptions)
  const body = await req.json()
  const { password, projectName } = body

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { documents: true },
  })
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }
  // Only owner can delete
  if (!session || !session.user || project.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (!password || !projectName) {
    return NextResponse.json(
      { error: 'Password and project name required' },
      { status: 400 }
    )
  }
  if (project.name !== projectName) {
    return NextResponse.json(
      { error: 'Project name does not match' },
      { status: 400 }
    )
  }
  if (!project.passwordHash) {
    return NextResponse.json(
      { error: 'Project password not set' },
      { status: 400 }
    )
  }
  const valid = await verifyPassword(password, project.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }
  // Delete all documents/files associated with the project
  await prisma.document.deleteMany({ where: { projectId } })
  // Delete the project
  await prisma.project.delete({ where: { id: projectId } })
  return NextResponse.json({ ok: true })
}
