let express = require("express");
let router = express.Router();
const basicAuth = require("express-basic-auth");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Define a username and password for basic authentication
const users = {"teznix":"1234"};

// Middleware for basic authentication
const authMiddleware = basicAuth({
  users,
  challenge: true, // Send authentication challenge if credentials are missing
  unauthorizedResponse: "Unauthorized",
});

/* GET home page. */
router.get("/", authMiddleware, async function (req, res, next) {
  let dataFromDB;
  try {
    dataFromDB = await prisma.tickets.findMany({
      where: {
        isClosed: false,
      },
      orderBy: {
        isClosed: "asc",
      },
    });
    console.log(dataFromDB);
  } catch (err) {
    console.log("Index view: " + err);
  } finally {
    // Do not disconnect the Prisma client here, as you might want to use it in other parts of your application
  }

  res.render("index", { title: "Express", data: dataFromDB });
});

router.delete("/", authMiddleware, async function (req, res, next) {
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
    // Do not disconnect the Prisma client here
    res.redirect("/"); // Redirect back to the home page after the delete request is done
  }
});

module.exports = router;
