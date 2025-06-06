import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { DocumentSchema } from '@/validations/document'
import { extractPdfText } from '@/lib/pdf'
import { JSDOM } from 'jsdom'

async function extractWebPageText(
  url: string
): Promise<{ text: string; metadata?: { title?: string; error?: string } }> {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch web page')
    const html = await res.text()
    // Use JSDOM to parse and extract main content
    const dom = new JSDOM(html)
    const doc = dom.window.document
    // Try to extract main content heuristically
    let text = ''
    const main = doc.querySelector('main, article')
    if (main) {
      text = main.textContent || ''
    } else {
      text = doc.body.textContent || ''
    }
    // Optionally extract metadata (title, etc)
    const title = doc.querySelector('title')?.textContent || ''
    return { text: text.trim(), metadata: { title } }
  } catch (e) {
    return { text: '', metadata: { error: (e as Error).message } }
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const { success, data: docData, error } = DocumentSchema.safeParse(body)
  if (!success) {
    return NextResponse.json(
      { error: 'Invalid input', details: error },
      { status: 400 }
    )
  }
  const { projectId, title, type, url, content, metadata } = docData
  let extractedText: string | undefined = undefined
  let finalMetadata = metadata
  if (type === 'pdf' && content) {
    extractedText = await extractPdfText(content)
  } else if (type === 'web' && url) {
    const { text, metadata: webMeta } = await extractWebPageText(url)
    extractedText = text
    finalMetadata = { ...metadata, ...webMeta }
  }
  const document = await prisma.document.create({
    data: {
      project: { connect: { id: projectId } },
      user: { connect: { id: session.user.id } },
      title,
      type,
      url,
      content,
      extractedText,
      metadata: finalMetadata,
    },
  })
  return NextResponse.json({ document })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  if (!projectId) {
    return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
  }
  // Check if project is public
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }
  if (!project.isPublic) {
    // Require authentication for private projects
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  const documents = await prisma.document.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ documents })
}
