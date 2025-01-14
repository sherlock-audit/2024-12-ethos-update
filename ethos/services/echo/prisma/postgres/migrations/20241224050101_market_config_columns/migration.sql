-- AlterTable
ALTER TABLE "markets" ADD COLUMN     "basePrice" TEXT NOT NULL DEFAULT '0',
ADD COLUMN     "creationCost" TEXT NOT NULL DEFAULT '0';
