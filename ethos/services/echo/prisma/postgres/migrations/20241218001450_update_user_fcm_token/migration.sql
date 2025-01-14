/*
  Warnings:

  - A unique constraint covering the columns `[profileId,deviceIdentifier]` on the table `user_fcm_tokens` will be added. If there are existing duplicate values, this will fail.
  - Made the column `deviceIdentifier` on table `user_fcm_tokens` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userAgent` on table `user_fcm_tokens` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "user_fcm_tokens_profileId_fcmToken_key";

-- AlterTable
ALTER TABLE "user_fcm_tokens" ALTER COLUMN "deviceIdentifier" SET NOT NULL,
ALTER COLUMN "userAgent" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_fcm_tokens_profileId_deviceIdentifier_key" ON "user_fcm_tokens"("profileId", "deviceIdentifier");
