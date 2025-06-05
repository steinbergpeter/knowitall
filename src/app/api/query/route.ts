import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { QuerySchema } from '@/validations/knowledge-graph'

// Create a research query
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const parsed = QuerySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error },
      { status: 400 }
    )
  }
  // Prisma expects queryText and a project relation
  const data = {
    queryText: parsed.data.query,
    project: { connect: { id: body.projectId } },
    // Optionally add documents if you have a relation
  }
  const query = await prisma.query.create({
    data,
  })
  return NextResponse.json({ query })
}

// List all research queries for a project
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
  const queries = await prisma.query.findMany({ where: { projectId } })
  return NextResponse.json({ queries })
}
