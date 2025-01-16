-- CreateTable
CREATE TABLE "claims" (
    "twitterUserId" TEXT NOT NULL,
    "initialAmount" INTEGER NOT NULL,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedAt" TIMESTAMP(3),

    CONSTRAINT "claims_pkey" PRIMARY KEY ("twitterUserId")
);

-- CreateTable
CREATE TABLE "claim_referrals" (
    "id" SERIAL NOT NULL,
    "fromTwitterUserId" TEXT NOT NULL,
    "toTwitterUserId" TEXT NOT NULL,
    "bonusAmountForSender" INTEGER NOT NULL,
    "bonusAmountForReceiver" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claim_referrals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "claim_referrals_fromTwitterUserId_idx" ON "claim_referrals"("fromTwitterUserId");

-- CreateIndex
CREATE INDEX "claim_referrals_toTwitterUserId_idx" ON "claim_referrals"("toTwitterUserId");

-- CreateIndex
CREATE UNIQUE INDEX "claim_referrals_fromTwitterUserId_toTwitterUserId_key" ON "claim_referrals"("fromTwitterUserId", "toTwitterUserId");

-- AddForeignKey
ALTER TABLE "claim_referrals" ADD CONSTRAINT "claim_referrals_fromTwitterUserId_fkey" FOREIGN KEY ("fromTwitterUserId") REFERENCES "claims"("twitterUserId") ON DELETE CASCADE ON UPDATE CASCADE;
