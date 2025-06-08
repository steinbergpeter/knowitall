/*
  Warnings:

  - You are about to drop the column `researchQueryId` on the `Edge` table. All the data in the column will be lost.
  - You are about to drop the column `researchQueryId` on the `Node` table. All the data in the column will be lost.
  - You are about to drop the column `researchQueryId` on the `Summary` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Edge" DROP CONSTRAINT "Edge_researchQueryId_fkey";

-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_researchQueryId_fkey";

-- DropForeignKey
ALTER TABLE "Summary" DROP CONSTRAINT "Summary_researchQueryId_fkey";

-- AlterTable
ALTER TABLE "Edge" DROP COLUMN "researchQueryId";

-- AlterTable
ALTER TABLE "Node" DROP COLUMN "researchQueryId";

-- AlterTable
ALTER TABLE "Summary" DROP COLUMN "researchQueryId";
