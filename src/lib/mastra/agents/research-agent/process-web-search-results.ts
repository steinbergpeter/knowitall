import prisma from '@/lib/prisma'
import type { WebSearchOutput } from '@/validations/web'
import type { Prisma } from '@prisma/client'
import {
  transformWebSearchOutputToDocumentsData,
  type DocumentData,
} from '../../transformers'

/**
 * Processes web search results: transforms them to DocumentData, checks worthiness, stores documents, and generates summaries.
 * @param webSearchResults Array of WebSearchOutput objects
 * @param projectId Project ID for document association
 * @param userId User ID for document ownership
 * @returns Array of generated summaries
 */
export async function processWebSearchResults(
  webSearchResults: WebSearchOutput[],
  projectId: string,
  userId: string
): Promise<Array<{ text: string; provenance?: string }>> {
  const summaries: Array<{ text: string; provenance?: string }> = []

  for (const searchOutput of webSearchResults) {
    const documentsDataArray: DocumentData[] =
      transformWebSearchOutputToDocumentsData(searchOutput, projectId)

    for (const docData of documentsDataArray) {
      if (
        docData.metadata &&
        typeof docData.metadata.tavilyScore === 'number' &&
        docData.metadata.tavilyScore > 0.5 &&
        docData.content
      ) {
        try {
          const prismaDocumentCreateData: Prisma.DocumentCreateInput = {
            project: { connect: { id: docData.projectId } },
            user: { connect: { id: userId } },
            title: docData.title,
            type: docData.type,
            url: docData.url,
            content: docData.content,
            extractedText: docData.content,
            metadata: docData.metadata as Prisma.InputJsonValue,
            source: docData.source,
          }

          await prisma.document.create({
            data: prismaDocumentCreateData,
          })
          // Generate a summary for the graph from this new document
          summaries.push({
            text: `Summary of: ${docData.title} - ${docData.content.substring(
              0,
              150
            )}...`,
            provenance: docData.url,
          })
        } catch (dbError) {
          console.error(
            'Failed to store web search result as document:',
            dbError
          )
        }
      }
    }
  }
  return summaries
}
