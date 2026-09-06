-- CreateTable
CREATE TABLE "track_global_cache" (
    "track" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "found" BOOLEAN NOT NULL DEFAULT false,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "track_global_cache_pkey" PRIMARY KEY ("track")
);
