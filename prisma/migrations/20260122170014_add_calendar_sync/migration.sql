/*
  Warnings:

  - The `rsvpStatus` column on the `Event` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `FollowUp` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Paper` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `stage` column on the `Person` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `type` on the `FollowUp` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `Interaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RelationshipStage" AS ENUM ('NEW', 'CONNECTED', 'CHATTED', 'ONGOING', 'INNER_CIRCLE');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('COFFEE_CHAT', 'MEETUP', 'DM', 'EMAIL', 'CALL');

-- CreateEnum
CREATE TYPE "FollowUpType" AS ENUM ('THANK_YOU', 'NUDGE', 'VALUE_RECONNECT', 'CHECK_IN');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('OPEN', 'DONE');

-- CreateEnum
CREATE TYPE "EventRSVPStatus" AS ENUM ('INTERESTED', 'GOING', 'WENT', 'NOT_GOING');

-- CreateEnum
CREATE TYPE "PaperStatus" AS ENUM ('PLANNED', 'READING', 'READ', 'IMPLEMENTED', 'REVISITED');

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "rsvpStatus",
ADD COLUMN     "rsvpStatus" "EventRSVPStatus" NOT NULL DEFAULT 'INTERESTED';

-- AlterTable
ALTER TABLE "FollowUp" DROP COLUMN "type",
ADD COLUMN     "type" "FollowUpType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "FollowUpStatus" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "Interaction" DROP COLUMN "type",
ADD COLUMN     "type" "InteractionType" NOT NULL;

-- AlterTable
ALTER TABLE "Paper" DROP COLUMN "status",
ADD COLUMN     "status" "PaperStatus" NOT NULL DEFAULT 'PLANNED';

-- AlterTable
ALTER TABLE "Person" DROP COLUMN "stage",
ADD COLUMN     "stage" "RelationshipStage" NOT NULL DEFAULT 'NEW';

-- CreateIndex
CREATE INDEX "FollowUp_dueDate_status_idx" ON "FollowUp"("dueDate", "status");
