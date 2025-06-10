/*
  Warnings:

  - You are about to drop the column `documentId` on the `Edge` table. All the data in the column will be lost.
  - You are about to drop the column `documentId` on the `Node` table. All the data in the column will be lost.
  - You are about to drop the column `documentId` on the `Summary` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Edge" DROP CONSTRAINT "Edge_documentId_fkey";

-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_documentId_fkey";

-- DropForeignKey
ALTER TABLE "Summary" DROP CONSTRAINT "Summary_documentId_fkey";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'user';

-- AlterTable
ALTER TABLE "Edge" DROP COLUMN "documentId";

-- AlterTable
ALTER TABLE "Node" DROP COLUMN "documentId";

-- AlterTable
ALTER TABLE "Summary" DROP COLUMN "documentId";
