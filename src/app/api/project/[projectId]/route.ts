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
