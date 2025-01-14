-- Custom SQL

-- Change txHash in blockchain_events to be case insensitive

-- Create a temporary column to store the txHash values in cocrrect type
ALTER TABLE "blockchain_events"
ADD COLUMN "txHash_temp" CITEXT;

-- Copy the values from txHash to txHash_temp
UPDATE "blockchain_events"
SET "txHash_temp" = "txHash";

-- Drop the old txHash column and create a new one with the correct type
ALTER TABLE "blockchain_events"
DROP COLUMN "txHash",
ADD COLUMN "txHash" CITEXT;

-- Copy the values from txHash_temp to txHash
UPDATE "blockchain_events"
SET "txHash" = "txHash_temp";

-- Drop the temporary column
ALTER TABLE "blockchain_events"
DROP COLUMN "txHash_temp",
ALTER COLUMN "txHash" SET NOT NULL;


-- Change txHash in score_history to be case insensitive

-- Create a temporary column to store the txHash values in cocrrect type
ALTER TABLE "score_history"
ADD COLUMN "txHash_temp" CITEXT;

-- Copy the values from txHash to txHash_temp
UPDATE "score_history"
SET "txHash_temp" = "txHash";

-- Drop the old txHash column and create a new one with the correct type
ALTER TABLE "score_history"
DROP COLUMN "txHash",
ADD COLUMN "txHash" CITEXT;

-- Copy the values from txHash_temp to txHash
UPDATE "score_history"
SET "txHash" = "txHash_temp";

-- Drop the temporary column
ALTER TABLE "score_history"
DROP COLUMN "txHash_temp";


-- Create missing indices
-- CreateIndex
CREATE INDEX "blockchain_events_txHash_idx" ON "blockchain_events"("txHash");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_events_blockNumber_blockIndex_txHash_key" ON "blockchain_events"("blockNumber", "blockIndex", "txHash");

-- CreateIndex
CREATE INDEX "score_history_target_txHash_idx" ON "score_history"("target", "txHash");


-- Make userkeys case insensitive
-- AlterTable
ALTER TABLE "contribution_score_checks" ALTER COLUMN "targetUserkey" SET DATA TYPE CITEXT;

-- AlterTable
ALTER TABLE "contribution_trust_checks" ALTER COLUMN "targetUserkey" SET DATA TYPE CITEXT;

-- AlterTable
ALTER TABLE "score_history" ALTER COLUMN "target" SET DATA TYPE CITEXT;
