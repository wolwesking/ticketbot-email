let express = require("express");
let router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/* GET home page. */
router.get("/", async function (req, res, next) {
  let dataFromDB;
  try {
      dataFromDB = await prisma.tickets.findMany({
        where: {
          isClosed: false
        },
        orderBy: {
          isClosed: 'asc',
        }
      });
    console.log(dataFromDB);
  } catch (err) {
    console.log("Index view: " + err);
  } finally {
    prisma.$disconnect();
  }

  res.render("index", { title: "Express", data: dataFromDB });
});

router.delete("/", async function (req, res, next) {
  const ticketId = parseInt(req.body.ticketId);

  try {
    await prisma.tickets.update({
      where: {
        id: ticketId,
      },
      data: {
        isClosed: true,
      },
    });
  } catch (err) {
    console.log("Index error " + err);
  } finally {
    prisma.$disconnect();
    res.redirect("/"); // Redirect back to the home page after the delete request is done
  }
});

module.exports = router;
