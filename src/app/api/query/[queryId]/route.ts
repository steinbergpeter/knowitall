import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { QuerySchema } from '@/validations/queries'

// Next.js route handlers receive context as { params: { queryId: string } }

interface Context {
  params: Promise<{ queryId: string }>
}

export async function GET(_req: NextRequest, context: Context) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { queryId } = await context.params
  if (!queryId) {
    return NextResponse.json({ error: 'Missing queryId' }, { status: 400 })
  }
  const query = await prisma.query.findUnique({
    where: { id: queryId },
  })
  if (!query) {
    return NextResponse.json({ error: 'Query not found' }, { status: 404 })
  }
  return NextResponse.json({ query })
}

export async function PATCH(req: NextRequest, context: Context) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { queryId } = await context.params
  if (!queryId) {
    return NextResponse.json({ error: 'Missing queryId' }, { status: 400 })
  }
  const body = await req.json()
  const parsed = QuerySchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error },
      { status: 400 }
    )
  }
  // Support updating queryText (from prompt) or other fields
  const data: Record<string, unknown> = {}
  if (parsed.data.prompt) data.queryText = parsed.data.prompt
  // Add more fields as needed
  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: 'No valid fields to update' },
      { status: 400 }
    )
  }
  const query = await prisma.query.update({
    where: { id: queryId },
    data,
  })
  return NextResponse.json({ query })
}

export async function DELETE(
  _req: NextRequest,
  context: { params: { queryId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { queryId } = context.params
  if (!queryId) {
    return NextResponse.json({ error: 'Missing queryId' }, { status: 400 })
  }
  await prisma.query.delete({ where: { id: queryId } })
  return NextResponse.json({ success: true })
}
