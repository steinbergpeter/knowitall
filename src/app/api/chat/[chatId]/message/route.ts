import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { MessageInputSchema } from '@/validations/message'
import { runResearchAgent } from '@/lib/mastra/agents/research-agent'
import { MessageAuthor } from '@prisma/client'

interface Context {
  params: Promise<{ chatId: string }>
}

// POST: Add a message to a chat (user or AI)
export async function POST(req: NextRequest, context: Context) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { chatId } = await context.params
  if (!chatId) {
    return NextResponse.json({ error: 'Missing chatId' }, { status: 400 })
  }
  const body = await req.json()
  const parseResult = MessageInputSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parseResult.error },
      { status: 400 }
    )
  }
  const { content, projectId } = parseResult.data
  try {
    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        chatId,
        projectId,
        author: 'user',
        content,
      },
    })
    // Fetch last 10 messages for context (including the new user message)
    const history = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: 10, // get the last 10 messages (most recent)
    })
    // Reverse to chronological order for the agent
    const messages = history.reverse().map((msg) => ({
      role: (msg.author === MessageAuthor.user ? 'user' : 'assistant') as
        | 'user'
        | 'assistant',
      content: msg.content,
    }))
    // Generate AI response using Mastra agent
    const aiResult = await runResearchAgent(messages, { projectId })
    const aiContent = aiResult.text || 'AI did not return a response.'
    const aiMessage = await prisma.message.create({
      data: {
        chatId,
        projectId,
        author: 'assistant',
        content: aiContent,
      },
    })

    return NextResponse.json({ userMessage, aiMessage })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to create message', details: (err as Error).message },
      { status: 500 }
    )
  }
}
