import { z } from 'zod'
// // Define the input and output schemas for the tool
// export const WebSearchInputSchema = z.object({
//   query: z.string().describe('The search query to run on the web'),
//   numResults: z.number().min(1).max(10).default(3).optional(),
// })

// export const WebSearchResultSchema = z.object({
//   title: z.string(),
//   url: z.string().url(),
//   snippet: z.string(),
// })

// export const WebSearchOutputSchema = z.object({
//   results: z.array(WebSearchResultSchema),
// // })
// export type WebSearchInput = z.infer<typeof WebSearchInputSchema>
// export type WebSearchResult = z.infer<typeof WebSearchResultSchema>
// export type WebSearchOutput = z.infer<typeof WebSearchOutputSchema>

export const WebSearchInputSchema = z.object({
  query: z.string().trim().min(1).max(200),
  options: z
    .object({
      searchDepth: z.enum(['basic', 'advanced']).optional(),
      topic: z.enum(['general', 'news', 'finance']).optional(),
      days: z.number().int().min(0).optional(),
      maxResults: z.number().int().min(1).max(100).optional(),
      includeImages: z.boolean().optional(),
      includeImageDescriptions: z.boolean().optional(),
      includeAnswer: z.boolean().optional(),
      includeRawContent: z.enum(['markdown', 'text']).optional(),
      includeDomains: z.array(z.string().url()).optional(),
      excludeDomains: z.array(z.string().url()).optional(),
      maxTokens: z.number().int().min(1).max(4096).optional(),
      timeRange: z
        .enum(['year', 'month', 'week', 'day', 'y', 'm', 'w', 'd'])
        .optional(),
      chunksPerSource: z.number().int().min(1).max(10).optional(),
      country: z.string().length(2).optional(), // ISO 3166-1 alpha-2
      timeout: z.number().int().min(1000).max(30000).optional(), // in milliseconds
      // Additional custom options
      customOptions: z.record(z.any()).optional(),
    })
    .optional(),
})

export const TavilyImageSchema = z.object({
  url: z.string().url(),
  description: z.string().optional(),
})

export const TavilyResultSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  content: z.string(),
  rawContent: z.string().optional(),
  score: z.number(),
  publishedDate: z.string(),
})

export const WebSearchOutputSchema = z.object({
  answer: z.string().optional(),
  query: z.string(),
  responseTime: z.number(),
  images: z.array(TavilyImageSchema),
  results: z.array(TavilyResultSchema),
})

export type WebSearchInput = z.infer<typeof WebSearchInputSchema>
export type WebSearchOutput = z.infer<typeof WebSearchOutputSchema>
