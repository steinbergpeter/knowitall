import prisma from '@/lib/prisma'
import { EdgeSchema } from '@/validations/research'
import { NextRequest, NextResponse } from 'next/server'

interface Context {
  params: Promise<{ projectId: string }>
}

// GET: List all edges for a project
export async function GET(_req: NextRequest, context: Context) {
  const { projectId } = await context.params
  const edges = await prisma.edge.findMany({ where: { projectId } })
  return NextResponse.json(edges)
}

// POST: Create a new edge
export async function POST(req: NextRequest, context: Context) {
  const { projectId } = await context.params
  const body = await req.json()
  const parse = EdgeSchema.safeParse(body)
  if (!parse.success)
    return NextResponse.json({ error: parse.error }, { status: 400 })
  const edge = await prisma.edge.create({ data: { ...parse.data, projectId } })
  return NextResponse.json(edge)
}

// PATCH: Update an edge
export async function PATCH(req: NextRequest, context: Context) {
  const { projectId } = await context.params
  const body = await req.json()
  const parse = EdgeSchema.safeParse(body)
  if (!parse.success || !parse.data.id)
    return NextResponse.json({ error: 'Invalid edge data' }, { status: 400 })
  const edge = await prisma.edge.update({
    where: { id: parse.data.id, projectId },
    data: parse.data,
  })
  return NextResponse.json(edge)
}

// DELETE: Delete an edge
export async function DELETE(req: NextRequest, context: Context) {
  const { projectId } = await context.params
  const { id } = await req.json()
  if (!id)
    return NextResponse.json({ error: 'Missing edge id' }, { status: 400 })
  await prisma.edge.delete({ where: { id, projectId } })
  return NextResponse.json({ success: true })
}
