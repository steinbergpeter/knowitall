import { Mastra } from '@mastra/core'
import { PostgresStore } from '@mastra/pg'
import { researchAgent } from './agents/research-agent'

const storage = new PostgresStore({
  connectionString: process.env.DATABASE_URL!,
})

export const mastra = new Mastra({
  agents: { ResearchAgent: researchAgent },
  storage,
})
