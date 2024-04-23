-- CreateTable
CREATE TABLE "MovieDemoContent" (
    "id" TEXT NOT NULL,
    "trailer_URL" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,

    CONSTRAINT "MovieDemoContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MovieDemoContent_movieId_key" ON "MovieDemoContent"("movieId");

-- CreateIndex
CREATE INDEX "MovieDemoContent_movieId_idx" ON "MovieDemoContent"("movieId");

-- AddForeignKey
ALTER TABLE "MovieDemoContent" ADD CONSTRAINT "MovieDemoContent_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
