import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { SummarySchema } from '@/validations/knowledge-graph'

interface Context {
  params: Promise<{ summaryId: string }>
}

export async function GET(_req: NextRequest, context: Context) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { summaryId } = await context.params
  if (!summaryId) {
    return NextResponse.json({ error: 'Missing summaryId' }, { status: 400 })
  }
  const summary = await prisma.summary.findUnique({
    where: { id: summaryId },
    include: { document: true },
  })
  if (!summary) {
    return NextResponse.json({ error: 'Summary not found' }, { status: 404 })
  }
  return NextResponse.json({ summary })
}

export async function PATCH(req: NextRequest, context: Context) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { summaryId } = await context.params
  if (!summaryId) {
    return NextResponse.json({ error: 'Missing summaryId' }, { status: 400 })
  }
  const body = await req.json()
  const parsed = SummarySchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error },
      { status: 400 }
    )
  }
  const summary = await prisma.summary.update({
    where: { id: summaryId },
    data: {
      ...parsed.data,
      ...(parsed.data.documentId ? { documentId: parsed.data.documentId } : {}),
    },
    include: { document: true },
  })
  return NextResponse.json({ summary })
}

export async function DELETE(_req: NextRequest, context: Context) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { summaryId } = await context.params
  if (!summaryId) {
    return NextResponse.json({ error: 'Missing summaryId' }, { status: 400 })
  }
  await prisma.summary.delete({ where: { id: summaryId } })
  return NextResponse.json({ success: true })
}
