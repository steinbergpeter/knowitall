import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { EdgeSchema } from '@/validations/knowledge-graph'

export async function GET(
  req: NextRequest,
  { params }: { params: { edgeId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { edgeId } = params
  if (!edgeId) {
    return NextResponse.json({ error: 'Missing edgeId' }, { status: 400 })
  }
  const edge = await prisma.edge.findUnique({
    where: { id: edgeId },
  })
  if (!edge) {
    return NextResponse.json({ error: 'Edge not found' }, { status: 404 })
  }
  return NextResponse.json({ edge })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { edgeId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { edgeId } = params
  if (!edgeId) {
    return NextResponse.json({ error: 'Missing edgeId' }, { status: 400 })
  }
  const body = await req.json()
  const parsed = EdgeSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error },
      { status: 400 }
    )
  }
  const edge = await prisma.edge.update({
    where: { id: edgeId },
    data: parsed.data,
  })
  return NextResponse.json({ edge })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { edgeId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { edgeId } = params
  if (!edgeId) {
    return NextResponse.json({ error: 'Missing edgeId' }, { status: 400 })
  }
  await prisma.edge.delete({ where: { id: edgeId } })
  return NextResponse.json({ success: true })
}
