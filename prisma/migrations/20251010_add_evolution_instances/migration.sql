CREATE TABLE "EvolutionInstance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "connectedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EvolutionInstance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EvolutionInstance_instanceId_key" ON "EvolutionInstance"("instanceId");
CREATE INDEX "EvolutionInstance_userId_idx" ON "EvolutionInstance"("userId");

ALTER TABLE "EvolutionInstance"
ADD CONSTRAINT "EvolutionInstance_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
