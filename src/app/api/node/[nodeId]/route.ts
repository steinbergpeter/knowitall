import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NodeSchema } from '@/validations/knowledge-graph'

export async function GET(
  req: NextRequest,
  { params }: { params: { nodeId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { nodeId } = params
  if (!nodeId) {
    return NextResponse.json({ error: 'Missing nodeId' }, { status: 400 })
  }
  const node = await prisma.node.findUnique({
    where: { id: nodeId },
  })
  if (!node) {
    return NextResponse.json({ error: 'Node not found' }, { status: 404 })
  }
  return NextResponse.json({ node })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { nodeId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { nodeId } = params
  if (!nodeId) {
    return NextResponse.json({ error: 'Missing nodeId' }, { status: 400 })
  }
  const body = await req.json()
  const parsed = NodeSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error },
      { status: 400 }
    )
  }
  const node = await prisma.node.update({
    where: { id: nodeId },
    data: parsed.data,
  })
  return NextResponse.json({ node })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { nodeId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { nodeId } = params
  if (!nodeId) {
    return NextResponse.json({ error: 'Missing nodeId' }, { status: 400 })
  }
  await prisma.node.delete({ where: { id: nodeId } })
  return NextResponse.json({ success: true })
}
