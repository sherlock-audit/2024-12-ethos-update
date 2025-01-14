/*
  Warnings:

  - Added the required column `attestationHash` to the `twitter_profiles_cache` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
TRUNCATE TABLE "twitter_profiles_cache";
ALTER TABLE "twitter_profiles_cache" ADD COLUMN     "attestationHash" CHAR(66) NOT NULL;

-- AlterTable
ALTER TABLE "vouches" ADD COLUMN     "attestationHash" CHAR(66),
ADD COLUMN     "subjectAddress" VARCHAR(42);

-- CreateIndex
CREATE INDEX "twitter_profiles_cache_attestationHash_idx" ON "twitter_profiles_cache"("attestationHash");

-- CreateIndex
CREATE INDEX "vouches_subjectAddress_idx" ON "vouches"("subjectAddress");

-- CreateIndex
CREATE INDEX "vouches_attestationHash_idx" ON "vouches"("attestationHash");
