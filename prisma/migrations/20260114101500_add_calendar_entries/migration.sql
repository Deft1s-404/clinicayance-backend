-- CreateEnum
CREATE TYPE "CalendarEntryType" AS ENUM ('AVAILABLE', 'TRAVEL', 'BLOCKED');

-- CreateTable
CREATE TABLE "CalendarEntry" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "CalendarEntryType" NOT NULL DEFAULT 'AVAILABLE',
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "timezone" TEXT,
    "country" TEXT,
    "city" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CalendarEntry_start_idx" ON "CalendarEntry"("start");

-- CreateIndex
CREATE INDEX "CalendarEntry_end_idx" ON "CalendarEntry"("end");

-- CreateIndex
CREATE INDEX "CalendarEntry_type_start_idx" ON "CalendarEntry"("type", "start");
