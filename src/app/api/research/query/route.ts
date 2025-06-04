import { NextRequest, NextResponse } from 'next/server'
import { ResearchQuerySchema } from '@/validations/knowledge-graph'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// Zod schema for validating incoming research queries

export async function POST(req: NextRequest) {
  // Auth check
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = ResearchQuerySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error },
        { status: 400 }
      )
    }

    // TODO: Mastra agent orchestration logic goes here
    // 1. Ingest documents (if any)
    // 2. Extract entities/relations using OpenAI via Mastra
    // 3. Build knowledge graph (nodes/edges)
    // 4. Return structured data

    return NextResponse.json({
      message: 'Research query received',
      data: parsed.data,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Server error',
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    )
  }
}
