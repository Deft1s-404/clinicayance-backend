-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('IN_PERSON', 'ONLINE');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "meetingLink" TEXT,
ADD COLUMN     "type" "AppointmentType" NOT NULL DEFAULT 'IN_PERSON';
