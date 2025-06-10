import prisma from '@/lib/prisma'
import { SummarySchema } from '@/validations/research'
import { NextRequest, NextResponse } from 'next/server'

interface Context {
  params: Promise<{ projectId: string }>
}
// GET: List all summaries for a project
export async function GET(_req: NextRequest, context: Context) {
  const { projectId } = await context.params
  const summaries = await prisma.summary.findMany({ where: { projectId } })
  return NextResponse.json(summaries)
}

// POST: Create a new summary
export async function POST(req: NextRequest, context: Context) {
  const { projectId } = await context.params
  const body = await req.json()
  const parse = SummarySchema.safeParse(body)
  if (!parse.success)
    return NextResponse.json({ error: parse.error }, { status: 400 })
  const summary = await prisma.summary.create({
    data: { ...parse.data, projectId },
  })
  return NextResponse.json(summary)
}

// PATCH: Update a summary
export async function PATCH(req: NextRequest, context: Context) {
  const { projectId } = await context.params
  const body = await req.json()
  const parse = SummarySchema.safeParse(body)
  if (!parse.success || !parse.data.id)
    return NextResponse.json({ error: 'Invalid summary data' }, { status: 400 })
  const summary = await prisma.summary.update({
    where: { id: parse.data.id, projectId },
    data: parse.data,
  })
  return NextResponse.json(summary)
}

// DELETE: Delete a summary
export async function DELETE(req: NextRequest, context: Context) {
  const { projectId } = await context.params
  const { id } = await req.json()
  if (!id)
    return NextResponse.json({ error: 'Missing summary id' }, { status: 400 })
  await prisma.summary.delete({ where: { id, projectId } })
  return NextResponse.json({ success: true })
}
