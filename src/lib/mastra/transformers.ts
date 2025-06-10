import { WebSearchOutputSchema, TavilyResultSchema } from '@/validations/web'
import { DocumentSchema } from '@/validations/document'
import { z } from 'zod'

// Infer types from Zod schemas
export type WebSearchOutput = z.infer<typeof WebSearchOutputSchema>
export type TavilySearchResult = z.infer<typeof TavilyResultSchema>
export type DocumentData = z.infer<typeof DocumentSchema>

/**
 * Transforms a WebSearchOutput object (containing multiple Tavily search results)
 * into an array of DocumentData objects (conforming to DocumentSchema).
 *
 * @param webSearchOutput The entire search output object from the web search tool.
 * @param projectId The ID of the project these documents belong to.
 * @returns An array of data objects conforming to DocumentSchema.
 */
export function transformWebSearchOutputToDocumentsData(
  webSearchOutput: WebSearchOutput,
  projectId: string
): DocumentData[] {
  const documentsData: DocumentData[] = []

  if (webSearchOutput.results && webSearchOutput.results.length > 0) {
    for (const tavilyResult of webSearchOutput.results) {
      const singleDocumentData: DocumentData = {
        projectId: projectId,
        title: tavilyResult.title,
        type: 'web', // Indicates the source type
        url: tavilyResult.url,
        content: tavilyResult.rawContent || tavilyResult.content,
        metadata: {
          // Conforms to DocumentSchema's metadata (record(z.any()).optional())
          retrievalSource: 'webSearchTool', // Custom metadata key
          tavilyScore: tavilyResult.score,
          publishedDate: tavilyResult.publishedDate,
        },
        source: 'agent',
      }

      // Validate against DocumentSchema before pushing, for robustness (optional)
      const { success, data, error } =
        DocumentSchema.safeParse(singleDocumentData)
      if (success) {
        documentsData.push(data)
      } else {
        console.warn(
          'Failed to parse transformed document data:',
          error,
          tavilyResult
        )
      }
      documentsData.push(singleDocumentData) // Assuming direct push after transformation
    }
  }
  return documentsData
}
