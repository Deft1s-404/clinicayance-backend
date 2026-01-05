-- CreateTable
CREATE TABLE "VindiIntegration" (
    "id" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "connectedByUserId" TEXT,
    "connectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VindiIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VindiIntegration_connectedByUserId_idx" ON "VindiIntegration"("connectedByUserId");

-- AddForeignKey
ALTER TABLE "VindiIntegration" ADD CONSTRAINT "VindiIntegration_connectedByUserId_fkey" FOREIGN KEY ("connectedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
