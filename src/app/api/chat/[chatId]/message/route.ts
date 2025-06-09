import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { MessageInputSchema } from '@/validations/message'

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
    // Simulate AI response
    const aiContent = `This is a simulated AI response to: "${content}"`
    const aiMessage = await prisma.message.create({
      data: {
        chatId,
        projectId,
        author: 'ai',
        content: aiContent,
      },
    })

    // Add a 4 second delay before responding
    await new Promise((resolve) => setTimeout(resolve, 4000))

    return NextResponse.json({ userMessage, aiMessage })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to create message', details: (err as Error).message },
      { status: 500 }
    )
  }
}
