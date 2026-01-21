-- CreateTable
CREATE TABLE "ProcedureImage" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "procedure" TEXT,
    "imageUrl" TEXT NOT NULL,
    "description" TEXT,
    "takenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcedureImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProcedureImage_clientId_idx" ON "ProcedureImage"("clientId");

-- AddForeignKey
ALTER TABLE "ProcedureImage" ADD CONSTRAINT "ProcedureImage_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
