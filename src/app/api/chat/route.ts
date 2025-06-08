import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ChatSchema } from '@/validations/chat'

// Create a new chat
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const { success, data, error } = ChatSchema.safeParse(body)
  if (!success) {
    return NextResponse.json(
      { error: 'Invalid input', details: error },
      { status: 400 }
    )
  }
  try {
    const chat = await prisma.chat.create({
      data: {
        projectId: data.projectId,
        title: data.title,
      },
    })
    return NextResponse.json(chat)
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to create chat', details: (err as Error).message },
      { status: 500 }
    )
  }
}

// List all chats for a project
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
  const chats = await prisma.chat.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ chats })
}
