/*
  Warnings:

  - The values [ai] on the enum `MessageAuthor` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MessageAuthor_new" AS ENUM ('user', 'assistant');
ALTER TABLE "Message" ALTER COLUMN "author" TYPE "MessageAuthor_new" USING ("author"::text::"MessageAuthor_new");
ALTER TYPE "MessageAuthor" RENAME TO "MessageAuthor_old";
ALTER TYPE "MessageAuthor_new" RENAME TO "MessageAuthor";
DROP TYPE "MessageAuthor_old";
COMMIT;
