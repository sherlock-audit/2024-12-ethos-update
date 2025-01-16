-- First transaction: Add the new enum value
BEGIN;
-- AlterEnum
ALTER TYPE "XpPointsHistoryItemType" ADD VALUE 'EXTENSION_CHECK_IN';
COMMIT;

-- Second transaction: Create the index
BEGIN;
-- CreateIndex
CREATE UNIQUE INDEX "xp_points_history_daily_checkin_idx" ON "xp_points_history" ("userkey", "type", DATE("createdAt")) WHERE type = 'EXTENSION_CHECK_IN';
COMMIT;
