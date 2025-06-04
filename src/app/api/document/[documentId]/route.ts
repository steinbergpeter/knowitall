import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { documentId: string } }
) {
  const session = await getServerSession(authOptions)
  const { documentId } = params
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
  return NextResponse.json({ document })
}
