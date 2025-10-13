-- Cria tabela para guardar respostas individuais da anamnese
CREATE TABLE "AnamnesisRecord" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "country" TEXT,
    "birthDate" TIMESTAMP(3),
    "language" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "previousAestheticTreatment" BOOLEAN,
    "originalResponses" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnamnesisRecord_pkey" PRIMARY KEY ("id")
);

CREATE OR REPLACE FUNCTION set_updated_at_anamnesis()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_anamnesis_updated
BEFORE UPDATE
ON "AnamnesisRecord"
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at_anamnesis();