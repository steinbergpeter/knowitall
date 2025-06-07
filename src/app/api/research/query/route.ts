import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import {
  KnowledgeGraphSchema,
  ResearchQuerySchema,
} from '@/validations/queries'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'

// TODO: Replace this mock with actual Mastra/AI orchestration
// For now, use a static example for local development
const aiResult = {
  nodes: [
    { id: 'bitcoin_mining', label: 'Bitcoin Mining', type: 'concept' },
    { id: 'energy_consumption', label: 'Energy Consumption', type: 'metric' },
  ],
  edges: [
    {
      source: 'bitcoin_mining',
      target: 'energy_consumption',
      type: 'involves',
    },
  ],
  summary_points: ['Bitcoin mining has significant energy consumption.'],
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const parse = ResearchQuerySchema.safeParse(body)
  if (!parse.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parse.error },
      { status: 400 }
    )
  }
  const { projectId, prompt } = parse.data

  const validated = KnowledgeGraphSchema.parse(aiResult)

  // Create a Query record
  const query = await prisma.query.create({
    data: {
      projectId,
      queryText: prompt,
    },
  })

  // Store nodes
  for (const node of validated.nodes) {
    await prisma.node.create({
      data: {
        id: node.id,
        projectId,
        label: node.label,
        type: node.type,
        metadata: node.metadata || {},
        researchQueryId: query.id,
        provenance: 'ai',
      },
    })
  }
  // Store edges
  for (const edge of validated.edges) {
    await prisma.edge.create({
      data: {
        projectId,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        metadata: edge.metadata || {},
        researchQueryId: query.id,
        provenance: 'ai',
      },
    })
  }
  // Store summary points
  for (const text of validated.summary_points) {
    await prisma.summary.create({
      data: {
        projectId,
        text,
        researchQueryId: query.id,
        provenance: 'ai',
      },
    })
  }

  // Return the created graph and summary
  return NextResponse.json({
    queryId: query.id,
    nodes: validated.nodes,
    edges: validated.edges,
    summary_points: validated.summary_points,
  })
}
