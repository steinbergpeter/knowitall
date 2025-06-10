import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { verifyPassword } from '@/lib/password'

interface Context {
  params: Promise<{ documentId: string }>
}

export async function GET(_req: NextRequest, context: Context) {
  const { documentId } = await context.params
  const session = await getServerSession(authOptions)
  if (!documentId) {
    return NextResponse.json({ error: 'Missing documentId' }, { status: 400 })
  }
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { project: true },
  })
  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }
  // If the document's project is not public, require authentication and ownership
  if (!document.project.isPublic) {
    if (!session || !session.user || document.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  // The returned document object includes the 'source' field
  return NextResponse.json({ document })
}

export async function DELETE(req: NextRequest, context: Context) {
  const { documentId } = await context.params
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!documentId) {
    return NextResponse.json({ error: 'Missing documentId' }, { status: 400 })
  }
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { project: true },
  })
  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }
  // Only project owner can delete
  if (document.project.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  // Require password in body
  const { password } = await req.json()
  if (!password || !document.project.passwordHash) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 })
  }
  const valid = verifyPassword(password, document.project.passwordHash!)

  if (!valid) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }
  await prisma.document.delete({ where: { id: documentId } })
  return NextResponse.json({ success: true })
}
