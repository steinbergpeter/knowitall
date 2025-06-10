import prisma from '@/lib/prisma'
import { NodeSchema } from '@/validations/research'
import { NextRequest, NextResponse } from 'next/server'

interface Context {
  params: Promise<{ projectId: string }>
}

// GET: List all nodes for a project
export async function GET(_req: NextRequest, context: Context) {
  const { projectId } = await context.params
  const nodes = await prisma.node.findMany({ where: { projectId } })
  return NextResponse.json(nodes)
}

// POST: Create a new node
export async function POST(req: NextRequest, context: Context) {
  const { projectId } = await context.params
  const body = await req.json()
  const parse = NodeSchema.safeParse(body)
  if (!parse.success)
    return NextResponse.json({ error: parse.error }, { status: 400 })
  const node = await prisma.node.create({ data: { ...parse.data, projectId } })
  return NextResponse.json(node)
}

// PATCH: Update a node
export async function PATCH(req: NextRequest, context: Context) {
  const { projectId } = await context.params
  const body = await req.json()
  const parse = NodeSchema.safeParse(body)
  if (!parse.success || !parse.data.id)
    return NextResponse.json({ error: 'Invalid node data' }, { status: 400 })
  const node = await prisma.node.update({
    where: { id: parse.data.id, projectId },
    data: parse.data,
  })
  return NextResponse.json(node)
}

// DELETE: Delete a node
export async function DELETE(req: NextRequest, context: Context) {
  const { projectId } = await context.params
  const { id } = await req.json()
  if (!id)
    return NextResponse.json({ error: 'Missing node id' }, { status: 400 })
  await prisma.node.delete({ where: { id, projectId } })
  return NextResponse.json({ success: true })
}
