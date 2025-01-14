-- Drop all data before adding a new required column
TRUNCATE "privy_logins" RESTART IDENTITY CASCADE;

-- AlterTable
ALTER TABLE "privy_logins" ADD COLUMN     "connectedWallet" CITEXT NOT NULL;

-- CreateIndex
CREATE INDEX "privy_logins_connectedWallet_idx" ON "privy_logins"("connectedWallet");
