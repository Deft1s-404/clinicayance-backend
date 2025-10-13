-- Adiciona campos extras solicitados para o cadastro de clientes
ALTER TABLE "Client"
  ADD COLUMN "age" INTEGER,
  ADD COLUMN "country" TEXT,
  ADD COLUMN "birthDate" TIMESTAMP(3),
  ADD COLUMN "language" TEXT,
  ADD COLUMN "intimateAssessmentPhotos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "anamnesisResponses" JSONB;
