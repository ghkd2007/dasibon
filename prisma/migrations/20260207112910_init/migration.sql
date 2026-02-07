-- CreateTable
CREATE TABLE "Bulletin" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL DEFAULT '11:00',
    "sermonTitleMain" TEXT NOT NULL DEFAULT '',
    "sermonTitleSub" TEXT NOT NULL DEFAULT '',
    "praises" TEXT NOT NULL DEFAULT '',
    "prayers" TEXT NOT NULL DEFAULT '',
    "passage" TEXT NOT NULL DEFAULT '',
    "sermonDescription" TEXT NOT NULL DEFAULT '',
    "commitment" TEXT NOT NULL DEFAULT '',
    "announcements" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bulletin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bulletin_date_key" ON "Bulletin"("date");
