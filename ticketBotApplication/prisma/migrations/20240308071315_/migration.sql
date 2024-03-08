/*
  Warnings:

  - A unique constraint covering the columns `[ticketId]` on the table `Tickets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Tickets_ticketId_key" ON "Tickets"("ticketId");
