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
