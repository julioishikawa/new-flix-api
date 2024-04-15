-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('BASIC', 'PREMIUM');

-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "description" TEXT NOT NULL;


