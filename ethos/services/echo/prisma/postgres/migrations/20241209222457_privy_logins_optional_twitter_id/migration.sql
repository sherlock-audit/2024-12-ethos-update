/*
  Warnings:

  - A unique constraint covering the columns `[twitterUserId]` on the table `privy_logins` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "privy_logins" ALTER COLUMN "twitterUserId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "privy_logins_twitterUserId_key" ON "privy_logins"("twitterUserId");
