import { authOptions } from '@/lib/auth'
import { verifyPassword } from '@/lib/password'
import prisma from '@/lib/prisma'
import { toProjectDetail } from '@/validations/project'
import { getServerSession } from 'next-auth/next'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  context: { params: { projectId: string } }
) {
  const params = context.params
  const { projectId } = params
  if (!projectId) {
    return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
  }
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { owner: true },
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
