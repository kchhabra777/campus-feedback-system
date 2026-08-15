/*
  Warnings:

  - Added the required column `recentRating` to the `ProfileRating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProfileRating" ADD COLUMN     "recentRating" DOUBLE PRECISION NOT NULL;
