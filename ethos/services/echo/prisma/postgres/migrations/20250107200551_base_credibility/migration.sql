-- CreateTable
CREATE TABLE "offchain_score" (
    "id" SERIAL NOT NULL,
    "userkey" CITEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offchain_score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "offchain_score_userkey_idx" ON "offchain_score"("userkey");
