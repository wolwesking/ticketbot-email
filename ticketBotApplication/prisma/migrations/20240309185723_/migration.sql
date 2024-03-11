-- CreateTable
CREATE TABLE "tickets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subject" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isClosed" BOOLEAN NOT NULL,
    "ticketId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "tickets_ticketId_key" ON "tickets"("ticketId");
