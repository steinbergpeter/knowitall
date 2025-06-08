import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface Context {
  params: Promise<{ chatId: string }>
}
// Get a chat and its queries
export async function GET(_req: NextRequest, context: Context) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { chatId } = await context.params
  if (!chatId) {
    return NextResponse.json({ error: 'Missing chatId' }, { status: 400 })
  }
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { queries: { orderBy: { createdAt: 'asc' } } },
  })
  if (!chat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
  }
  return NextResponse.json(chat)
}

// PATCH: Update chat (e.g., title)
export async function PATCH(req: NextRequest, context: Context) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { chatId } = await context.params
  if (!chatId) {
    return NextResponse.json({ error: 'Missing chatId' }, { status: 400 })
  }
  const body = await req.json()
  const { title } = body
  if (typeof title !== 'string' || title.length === 0) {
    return NextResponse.json({ error: 'Invalid title' }, { status: 400 })
  }
  try {
    const chat = await prisma.chat.update({
      where: { id: chatId },
      data: { title },
    })
    return NextResponse.json(chat)
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to update chat', details: (err as Error).message },
      { status: 500 }
    )
  }
}

// Delete a chat (cascade deletes queries)
export async function DELETE(_req: NextRequest, context: Context) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { chatId } = await context.params
  if (!chatId) {
    return NextResponse.json({ error: 'Missing chatId' }, { status: 400 })
  }
  try {
    await prisma.chat.delete({ where: { id: chatId } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to delete chat', details: (err as Error).message },
      { status: 500 }
    )
  }
}
