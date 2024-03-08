/*
  Warnings:

  - Added the required column `ticketId` to the `Tickets` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tickets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subject" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isClosed" BOOLEAN NOT NULL,
    "ticketId" TEXT NOT NULL
);
INSERT INTO "new_Tickets" ("date", "email", "id", "isClosed", "message", "name", "subject") SELECT "date", "email", "id", "isClosed", "message", "name", "subject" FROM "Tickets";
DROP TABLE "Tickets";
ALTER TABLE "new_Tickets" RENAME TO "Tickets";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
