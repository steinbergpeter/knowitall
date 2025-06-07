-- AlterTable
ALTER TABLE "Edge" ADD COLUMN     "documentId" TEXT;

-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "documentId" TEXT;

-- AlterTable
ALTER TABLE "Summary" ADD COLUMN     "documentId" TEXT;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
