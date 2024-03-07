-- CreateTable
CREATE TABLE "Tickets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subject" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isClosed" BOOLEAN NOT NULL
);
