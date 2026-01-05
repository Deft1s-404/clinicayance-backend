/*
  Warnings:

  - You are about to drop the column `clientId` on the `Lead` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_clientId_fkey";

-- DropIndex
DROP INDEX "Lead_clientId_idx";

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "clientId",
ADD COLUMN     "email" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "VindiIntegration" ALTER COLUMN "id" SET DEFAULT 'vindi';
