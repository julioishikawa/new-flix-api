-- CreateTable
CREATE TABLE "MovieContent" (
    "id" TEXT NOT NULL,
    "URL" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,

    CONSTRAINT "MovieContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MovieContent_movieId_key" ON "MovieContent"("movieId");

-- CreateIndex
CREATE INDEX "MovieContent_movieId_idx" ON "MovieContent"("movieId");

-- AddForeignKey
ALTER TABLE "MovieContent" ADD CONSTRAINT "MovieContent_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
