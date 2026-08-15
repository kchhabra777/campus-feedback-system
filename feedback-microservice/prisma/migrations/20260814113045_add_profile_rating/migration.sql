-- CreateTable
CREATE TABLE "ProfileRating" (
    "ratingId" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "overallRating" DOUBLE PRECISION NOT NULL,
    "totalReviews" INTEGER NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileRating_pkey" PRIMARY KEY ("ratingId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfileRating_userId_key" ON "ProfileRating"("userId");
