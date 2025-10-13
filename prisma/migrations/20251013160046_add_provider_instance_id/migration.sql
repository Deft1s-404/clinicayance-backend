/*
  Warnings:

  - A unique constraint covering the columns `[providerInstanceId]` on the table `EvolutionInstance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EvolutionInstance_providerInstanceId_key" ON "EvolutionInstance"("providerInstanceId");
