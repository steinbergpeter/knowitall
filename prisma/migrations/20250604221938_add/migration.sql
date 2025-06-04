-- AlterTable
ALTER TABLE "KnowledgeGraphEdge" ADD COLUMN     "provenance" TEXT,
ADD COLUMN     "researchQueryId" TEXT;

-- AlterTable
ALTER TABLE "KnowledgeGraphNode" ADD COLUMN     "provenance" TEXT,
ADD COLUMN     "researchQueryId" TEXT;

-- AlterTable
ALTER TABLE "SummaryPoint" ADD COLUMN     "provenance" TEXT,
ADD COLUMN     "researchQueryId" TEXT;

-- AddForeignKey
ALTER TABLE "KnowledgeGraphNode" ADD CONSTRAINT "KnowledgeGraphNode_researchQueryId_fkey" FOREIGN KEY ("researchQueryId") REFERENCES "ResearchQuery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeGraphEdge" ADD CONSTRAINT "KnowledgeGraphEdge_researchQueryId_fkey" FOREIGN KEY ("researchQueryId") REFERENCES "ResearchQuery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SummaryPoint" ADD CONSTRAINT "SummaryPoint_researchQueryId_fkey" FOREIGN KEY ("researchQueryId") REFERENCES "ResearchQuery"("id") ON DELETE SET NULL ON UPDATE CASCADE;
