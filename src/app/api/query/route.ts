import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { QuerySchema, AIMessageSchema } from '@/validations/queries'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

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
  } = QuerySchema.extend({ chatId: z.string().optional() }).safeParse(body)

  if (!inputOK) {
    return NextResponse.json(
      { error: 'Invalid input', details: inputErr },
      { status: 400 }
    )
  }

  let chatId = input.chatId

  // If no chatId, create a new chat first
  if (!chatId) {
    try {
      const newChat = await prisma.chat.create({
        data: {
          projectId: input.projectId,
          title: input.prompt.slice(0, 40) || 'New Chat',
        },
      })
      chatId = newChat.id
    } catch (err) {
      return NextResponse.json(
        { error: 'Failed to create chat', details: (err as Error).message },
        { status: 500 }
      )
    }
  }

  const data = {
    queryText: input.prompt,
    project: { connect: { id: input.projectId } },
    chat: { connect: { id: chatId } },
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
