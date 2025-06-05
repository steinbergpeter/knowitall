/*
  Warnings:

  - You are about to drop the column `authProviderId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_authProviderId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "authProviderId",
ALTER COLUMN "email" DROP NOT NULL;
