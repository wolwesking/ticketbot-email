

function generateRandomNumber() {
  let randomNumber = "";
  for (let i = 0; i < 8; i++) {
    const digit = Math.floor(Math.random() * 10); // Generates a random digit between 0 and 9
    randomNumber += digit;
  }
  return parseInt(randomNumber);
}


// async function searchAndGenerateUniqueTicketId() {
//   const prisma = new PrismaClient();

//   try {
//     const random8DigitNumber = generateRandomNumber();

//     // Check if the generated number already exists
//     const existingTicket = await prisma.tickets.findUnique({
//       where: { ticketId: random8DigitNumber },
//     });

//     if (existingTicket) {
//       // If it already exists, generate a new one recursively
//       return await searchAndGenerateUniqueTicketId();
//     } else {
//       return random8DigitNumber;
//     }
//   } finally {
//     await prisma.$disconnect();
//   }
// }

module.exports = generateRandomNumber;