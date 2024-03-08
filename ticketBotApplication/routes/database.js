const { PrismaClient } = require("@prisma/client");
let express = require("express");
let router = express.Router();

const prisma = new PrismaClient();

/* GET users listing. */
router.get("/", async function (req, res, next) {
  let dbData;
  try {
    dbData = await prisma.tickets.findMany();
    console.log(dbData);
  } catch (error) {
    console.log(error);
  } finally {
    prisma.$disconnect();
    res.render("database", { title: "Express", data: dbData });
  }
});

router.post("/", async function (req, res, next) {
  try {
    // Fetch data from the database
    const dbData = await prisma.tickets.findMany();

    // Convert the data to JSON
    const jsonData = JSON.stringify(dbData, null, 2);

    // Set the response headers for downloading
    res.setHeader("Content-disposition", "attachment; filename=database.json");
    res.setHeader("Content-type", "application/json");

    // Send the JSON data as the response
    res.send(jsonData);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  } finally {
    await prisma.$disconnect();
  }
});

module.exports = router;
