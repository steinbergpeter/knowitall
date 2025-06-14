import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { ProjectSchema } from '@/validations/project'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const parsed = ProjectSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error },
      { status: 400 }
    )
  }
  const { name, description, password } = parsed.data
  let passwordHash: string | undefined = undefined
  if (password) {
    passwordHash = await hashPassword(password)
  }
  const isPublic = !password
  const data: {
    name: string
    description?: string
    isPublic: boolean
    owner: { connect: { id: string } }
    passwordHash?: string
  } = {
    name,
    description,
    isPublic,
    owner: { connect: { id: session.user.id } },
  }
  if (passwordHash) {
    data.passwordHash = passwordHash
  }
  const project = await prisma.project.create({ data })
  return NextResponse.json({ project })
}

export async function GET() {
  // Always return all projects, regardless of session or guest
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ projects })
}
