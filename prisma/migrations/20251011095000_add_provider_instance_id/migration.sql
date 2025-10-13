ALTER TABLE "EvolutionInstance"
ADD COLUMN "providerInstanceId" TEXT;

CREATE UNIQUE INDEX "EvolutionInstance_providerInstanceId_key"
ON "EvolutionInstance"("providerInstanceId")
WHERE "providerInstanceId" IS NOT NULL;
