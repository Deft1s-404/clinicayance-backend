-- AlterTable
ALTER TABLE "alunos" ADD COLUMN     "curso" TEXT,
ADD COLUMN     "pagamento_ok" BOOLEAN NOT NULL DEFAULT false;
