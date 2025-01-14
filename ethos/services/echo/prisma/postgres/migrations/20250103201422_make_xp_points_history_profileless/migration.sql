/*
  Warnings:

  - You are about to drop the column `profileId` on the `xp_points_history` table. All the data in the column will be lost.
*/

-- AlterTable
ALTER TABLE "xp_points_history" ADD COLUMN "userkey" CITEXT;

-- Custom SQL: convert profileId value to userkey and set it to a new column
UPDATE "xp_points_history" xph
SET userkey = 'profileId:' || xph."profileId"::TEXT;

-- AlterEnum
ALTER TYPE "XpPointsHistoryItemType" ADD VALUE 'CLAIM';

-- DropForeignKey
ALTER TABLE "xp_points_history" DROP CONSTRAINT "xp_points_history_profileId_fkey";

-- DropIndex
DROP INDEX "xp_points_history_profileId_idx";

-- AlterTable
ALTER TABLE "xp_points_history" DROP COLUMN "profileId",
ALTER COLUMN "userkey" SET NOT NULL;

-- CreateIndex
CREATE INDEX "xp_points_history_userkey_idx" ON "xp_points_history"("userkey");
