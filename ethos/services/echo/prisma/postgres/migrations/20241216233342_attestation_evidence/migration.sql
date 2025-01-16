/*
  Warnings:

  - Added the required column `evidence` to the `attestations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attestations" ADD COLUMN     "evidence" TEXT NULL;

UPDATE "attestations" SET "evidence" = '';

ALTER TABLE "attestations" ALTER COLUMN   "evidence" SET NOT NULL;
