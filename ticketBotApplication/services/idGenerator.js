const { PrismaClient } = require("@prisma/client");

async function searchAndGenerateUniqueTicketId() {
  const prisma = new PrismaClient();

  try {
    // Get the latest ticket from the database
    const latestTicket = await prisma.tickets.findFirst({
      orderBy: {
        ticketId: 'desc',
      },
    });

    // Determine the starting point for the next ticket
    let startingPoint = 7860000;
    if (latestTicket) {
      startingPoint = Math.max(latestTicket.ticketId + 1, startingPoint);
    }

    // Check if the generated number already exists
    const existingTicket = await prisma.tickets.findUnique({
      where: {
        ticketId: startingPoint,
      },
    });

    if (existingTicket) {
      // If it already exists, generate a new one recursively
      return await searchAndGenerateUniqueTicketId();
    } else {
      return startingPoint;
    }
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = searchAndGenerateUniqueTicketId;
