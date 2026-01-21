-- Add country column to appointments with a default to keep existing rows valid
ALTER TABLE "Appointment"
ADD COLUMN "country" TEXT NOT NULL DEFAULT 'Brasil';
