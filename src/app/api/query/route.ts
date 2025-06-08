import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { QuerySchema } from '@/validations/knowledge-graph'
import { AIMessageSchema } from '@/validations/queries'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'

// Create a research query
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const {
    success: inputOK,
    data: input,
    error: inputErr,
  } = QuerySchema.safeParse(body)

  if (!inputOK) {
    return NextResponse.json(
      { error: 'Invalid input', details: inputErr },
      { status: 400 }
    )
  }

  const data = {
    queryText: input.prompt,
    project: { connect: { id: input.projectId } },
  }

  try {
    await prisma.query.create({ data })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to save query', details: (err as Error).message },
      { status: 500 }
    )
  }

  const aiMessage = {
    role: 'ai',
    content: `This simulates a response to your query: "${input.prompt}"`,
  }

  const {
    success: aiOk,
    data: aiData,
    error: aiErr,
  } = AIMessageSchema.safeParse(aiMessage)

  if (!aiOk) {
    return NextResponse.json(
      { error: 'AI response validation failed', details: aiErr },
      { status: 500 }
    )
  }

  // Return only the AI message (frontend expects AIMessageSchema)
  return NextResponse.json(aiData)
}

// List all research queries for a project
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  if (!projectId) {
    return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
  }
  const queries = await prisma.query.findMany({ where: { projectId } })
  return NextResponse.json({ queries })
}
