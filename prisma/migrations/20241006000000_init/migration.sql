-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('NEW', 'ACTIVE', 'INACTIVE', 'VIP', 'LOST');

-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('BOOKED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE,
    "phone" TEXT,
    "source" TEXT,
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" "ClientStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT PRIMARY KEY,
    "clientId" TEXT NOT NULL REFERENCES "Client" ("id") ON DELETE CASCADE,
    "source" TEXT,
    "notes" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "stage" "LeadStage" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Lead_clientId_idx" ON "Lead" ("clientId");

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT PRIMARY KEY,
    "clientId" TEXT NOT NULL REFERENCES "Client" ("id") ON DELETE CASCADE,
    "procedure" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'BOOKED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Appointment_clientId_idx" ON "Appointment" ("clientId");

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT PRIMARY KEY,
    "appointmentId" TEXT NOT NULL REFERENCES "Appointment" ("id") ON DELETE CASCADE,
    "clientId" TEXT NOT NULL REFERENCES "Client" ("id") ON DELETE CASCADE,
    "value" DECIMAL(10,2) NOT NULL,
    "method" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "pixTxid" TEXT,
    "comprovanteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Payment_appointmentId_idx" ON "Payment" ("appointmentId");
CREATE INDEX "Payment_clientId_idx" ON "Payment" ("clientId");

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "CampaignLog" (
    "id" TEXT PRIMARY KEY,
    "campaignId" TEXT NOT NULL REFERENCES "Campaign" ("id") ON DELETE CASCADE,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "CampaignLog_campaignId_idx" ON "CampaignLog" ("campaignId");

-- CreateTable
CREATE TABLE "FunnelEvent" (
    "id" TEXT PRIMARY KEY,
    "clientId" TEXT NOT NULL REFERENCES "Client" ("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "FunnelEvent_clientId_idx" ON "FunnelEvent" ("clientId");
CREATE INDEX "FunnelEvent_type_createdAt_idx" ON "FunnelEvent" ("type", "createdAt");

-- Trigger updatedAt columns
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_user
BEFORE UPDATE ON "User"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_client
BEFORE UPDATE ON "Client"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_lead
BEFORE UPDATE ON "Lead"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_appointment
BEFORE UPDATE ON "Appointment"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_payment
BEFORE UPDATE ON "Payment"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_campaign
BEFORE UPDATE ON "Campaign"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
