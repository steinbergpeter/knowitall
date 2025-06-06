import { verifyPassword } from '@/lib/password'
import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  context: { params: { projectId: string } }
) {
  const { projectId } = context.params
  const { password } = await req.json()
  if (!projectId || !password) {
    return NextResponse.json(
      { error: 'Missing projectId or password' },
      { status: 400 }
    )
  }
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project || !project.passwordHash) {
    return NextResponse.json(
      { error: 'Project not found or not private' },
      { status: 404 }
    )
  }
  const valid = await verifyPassword(password, project.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }
  // Set a secure, httpOnly cookie for project access
  const cookieKey = `project_access_${project.id}`
  const res = NextResponse.json({ ok: true })
  res.cookies.set(cookieKey, password, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })
  return res
}
