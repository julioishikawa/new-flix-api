/*
  Warnings:

  - You are about to drop the column `gender` on the `Movie` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "gender",
ADD COLUMN     "genres" TEXT[];
