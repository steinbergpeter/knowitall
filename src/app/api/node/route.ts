import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NodeSchema } from '@/validations/knowledge-graph'

// Create a knowledge graph node
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const parsed = NodeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error },
      { status: 400 }
    )
  }
  // projectId is required by the model, researchQueryId is optional but must be undefined if not present
  const { researchQueryId, ...rest } = parsed.data
  const data = {
    ...rest,
    projectId: body.projectId,
    provenance: parsed.data.provenance,
    metadata: parsed.data.metadata,
    ...(researchQueryId ? { researchQueryId } : {}),
  }
  const node = await prisma.node.create({
    data,
  })
  return NextResponse.json({ node })
}

// List all nodes for a project or research query
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const researchQueryId = searchParams.get('researchQueryId')
  if (!projectId && !researchQueryId) {
    return NextResponse.json(
      { error: 'Missing projectId or researchQueryId' },
      { status: 400 }
    )
  }
  const where: { projectId?: string; researchQueryId?: string } = {}
  if (projectId) where.projectId = projectId
  if (researchQueryId) where.researchQueryId = researchQueryId
  const nodes = await prisma.node.findMany({ where })
  return NextResponse.json({ nodes })
}
