/*
  Warnings:

  - You are about to drop the `ProcedureImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProcedureImage" DROP CONSTRAINT "ProcedureImage_clientId_fkey";

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "beforeAfterPhotos" JSONB;

-- DropTable
DROP TABLE "ProcedureImage";
