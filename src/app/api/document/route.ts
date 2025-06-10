import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { DocumentSchema } from '@/validations/document'
import { extractPdfText } from '@/lib/scrapers/pdf'
import { extractWebPageText } from '@/lib/scrapers/web'
import { runResearchAgent } from '@/lib/mastra/agents/research-agent'

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
  const { projectId, title, type, url, content, metadata, source } = docData
  let extractedText: string | undefined = undefined
  let finalMetadata = metadata
  if (type === 'pdf' && content) {
    extractedText = await extractPdfText(content)
  } else if (type === 'web' && url) {
    const { text, metadata: webMeta } = await extractWebPageText(url)
    extractedText = text
    finalMetadata = { ...metadata, ...webMeta }
  }

  // Add to Database
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
      source: source || 'user', // set source, default to 'user'
    },
  })

  // Run research agent on extracted text (if present)
  // to extract and store graph data
  if (extractedText) {
    const instruction =
      'Instruction: Extract all relevant entities and relationships from the following document and add them to the knowledge graph. Output graph data in the required JSON format.\n\n'
    await runResearchAgent(
      [{ role: 'user', content: instruction + extractedText }],
      {
        projectId,
        documentId: document.id,
      }
    )
  }

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
