-- AlterTable
ALTER TABLE "markets" ADD COLUMN     "marketCapWei" TEXT NOT NULL DEFAULT '0',
ADD COLUMN     "priceChange24hrPercent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "volume24hrWei" TEXT NOT NULL DEFAULT '0',
ADD COLUMN     "volumeTotalWei" TEXT NOT NULL DEFAULT '0';
