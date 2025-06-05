/*
  Warnings:

  - You are about to drop the `KnowledgeGraphEdge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `KnowledgeGraphNode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResearchQuery` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SummaryPoint` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "KnowledgeGraphEdge" DROP CONSTRAINT "KnowledgeGraphEdge_projectId_fkey";

-- DropForeignKey
ALTER TABLE "KnowledgeGraphEdge" DROP CONSTRAINT "KnowledgeGraphEdge_researchQueryId_fkey";

-- DropForeignKey
ALTER TABLE "KnowledgeGraphNode" DROP CONSTRAINT "KnowledgeGraphNode_projectId_fkey";

-- DropForeignKey
ALTER TABLE "KnowledgeGraphNode" DROP CONSTRAINT "KnowledgeGraphNode_researchQueryId_fkey";

-- DropForeignKey
ALTER TABLE "ResearchQuery" DROP CONSTRAINT "ResearchQuery_projectId_fkey";

-- DropForeignKey
ALTER TABLE "SummaryPoint" DROP CONSTRAINT "SummaryPoint_projectId_fkey";

-- DropForeignKey
ALTER TABLE "SummaryPoint" DROP CONSTRAINT "SummaryPoint_researchQueryId_fkey";

-- DropTable
DROP TABLE "KnowledgeGraphEdge";

-- DropTable
DROP TABLE "KnowledgeGraphNode";

-- DropTable
DROP TABLE "ResearchQuery";

-- DropTable
DROP TABLE "SummaryPoint";

-- CreateTable
CREATE TABLE "Query" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "queryText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Query_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "researchQueryId" TEXT,
    "provenance" TEXT,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Edge" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "researchQueryId" TEXT,
    "provenance" TEXT,

    CONSTRAINT "Edge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Summary" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "researchQueryId" TEXT,
    "provenance" TEXT,

    CONSTRAINT "Summary_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Query" ADD CONSTRAINT "Query_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_researchQueryId_fkey" FOREIGN KEY ("researchQueryId") REFERENCES "Query"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_researchQueryId_fkey" FOREIGN KEY ("researchQueryId") REFERENCES "Query"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_researchQueryId_fkey" FOREIGN KEY ("researchQueryId") REFERENCES "Query"("id") ON DELETE SET NULL ON UPDATE CASCADE;
