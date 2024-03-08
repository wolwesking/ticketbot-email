/*
  Warnings:

  - You are about to alter the column `ticketId` on the `Tickets` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

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
    "ticketId" INTEGER NOT NULL
);
INSERT INTO "new_Tickets" ("date", "email", "id", "isClosed", "message", "name", "subject", "ticketId") SELECT "date", "email", "id", "isClosed", "message", "name", "subject", "ticketId" FROM "Tickets";
DROP TABLE "Tickets";
ALTER TABLE "new_Tickets" RENAME TO "Tickets";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
