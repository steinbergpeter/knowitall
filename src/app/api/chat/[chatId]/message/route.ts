import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { MessageInputSchema } from '@/validations/message'
import { runResearchAgent } from '@/lib/mastra/agents/research-agent'
import { MessageAuthor } from '@prisma/client'
import type { WebLinkChecklistItem } from '@/types/web-link-checklist-item'

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
    // Special handling: user approval of web search results
    if (content.startsWith('/approve-web-links')) {
      // Parse approved IDs
      const match = content.match(/^\/approve-web-links\s+(.+)/)
      const approvedIds = match
        ? match[1].split(',').map((id) => id.trim())
        : []
      // Find the last assistant message with webLinks in metadata (JSON)
      const lastAssistantMsg = await prisma.message.findFirst({
        where: {
          chatId,
          author: 'assistant',
        },
        orderBy: { createdAt: 'desc' },
      })
      // Try to get webLinks from content (JSON) or metadata (if you add it)
      let pendingWebLinks: WebLinkChecklistItem[] = []
      if (lastAssistantMsg && lastAssistantMsg.content) {
        try {
          const parsed = JSON.parse(lastAssistantMsg.content) as {
            webLinks?: WebLinkChecklistItem[]
          }
          if (parsed && Array.isArray(parsed.webLinks)) {
            pendingWebLinks = parsed.webLinks
          }
        } catch {}
      }
      // Filter approved links
      const approvedLinks = pendingWebLinks.filter((link) =>
        approvedIds.includes(link.id)
      )
      // Improved workflow: For each approved link, scrape, store, and extract knowledge
      for (const link of approvedLinks) {
        // 1. Scrape the web page content
        const { extractWebPageText } = await import('@/lib/scrapers/web')
        const scraped = await extractWebPageText(link.url)
        // 2. Store the scraped content as a document
        const document = await prisma.document.create({
          data: {
            project: { connect: { id: projectId } },
            user: { connect: { id: session.user.id } },
            title: link.title,
            url: link.url,
            content: scraped.text,
            extractedText: scraped.text,
            type: 'web',
            source: 'web',
            metadata: { ...scraped.metadata, originalSummary: link.summary },
          },
        })
        // 3. Run the agent on the scraped content to extract knowledge
        await runResearchAgent([{ role: 'user', content: scraped.text }], {
          projectId,
          documentId: document.id,
          userId: session.user.id,
          documentContext: scraped.metadata,
        })
        // 4. Optionally, persist the extracted graph (already handled in runResearchAgent)
      }
      // Save user approval message
      const userMessage = await prisma.message.create({
        data: {
          chatId,
          projectId,
          author: 'user',
          content,
        },
      })
      // Respond with confirmation
      const aiMessage = await prisma.message.create({
        data: {
          chatId,
          projectId,
          author: 'assistant',
          content: `Added ${approvedLinks.length} web results to your knowledge graph.`,
        },
      })
      return NextResponse.json({ userMessage, aiMessage })
    }

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
