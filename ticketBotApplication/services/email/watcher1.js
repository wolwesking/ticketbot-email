const inbox = require("inbox");
const { simpleParser } = require("mailparser");
const nodemailer = require("nodemailer");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
const alreadyOpenedSameTicket = require('./already');
const searchAndGenerateUniqueTicketId = require("../idGenerator");

const email = process.env.EMAIL_1;
const password = process.env.PASSWORD_1;
const supportEmail = process.env.SUPPORT_EMAIL_1;

const prisma = new PrismaClient();

// Replace these values with your Outlook email credentials and server details

const client = inbox.createConnection(993, "outlook.office365.com", {
  secureConnection: true,
  auth: { user: email, pass: password },
});

// Connect to the mail server
client.connect();

client.on("connect", () => {
  console.log("Connected to the mail server");

  // Open the INBOX mailbox
  client.openMailbox("INBOX", { readOnly: true }, (error, info) => {
    if (error) {
      console.error("Error opening mailbox:", error);
    } else {
      console.log("Mailbox opened:", info);

      // Start listening for new emails
      client.on("new", (message) => {
        // Check if it's a reply
        if (!message.inReplyTo) {
          // Fetch the email content and subject using tWhe message's UID
          fetchEmailContentAndSubject(
            message.UID,
            (err, { content, subject }) => {
              // Check for errors and output
              if (err) {
                console.error("Error fetching email content and subject:", err);
              } else {
                console.log("Subject:", subject);
                console.log("Raw Email Content:", content);

                // Send the email to two recipients with attachments
                sendEmailWithAttachments(subject, content);
              }
            }
          );
        } else {
          console.log("Email is a reply. Skipping forwarding.");
        }
      });

      // Enter idle mode to listen for updates
      client.idle();
    }
  });
});

client.on("close", () => {
  console.log("Connection closed");
});

client.on("error", (error) => {
  console.error("Error:", error);
});

// Function to fetch email content and subject using the message's UID
function fetchEmailContentAndSubject(uid, callback) {
  const f = client.createMessageStream(uid);
  let content = "";
  let subject = "";

  f.on("data", (chunk) => {
    content += chunk;
  });

  f.on("end", () => {
    simpleParser(content, (err, parsed) => {
      subject = parsed.subject || "No Subject";
      callback(err, { content, subject });
    });
  });
}

// Function to send an email with attachments

async function sendEmailWithAttachments(subject, content) {
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: email,
      pass: password,
    },
  });

  const parsedOriginalEmail = await simpleParser(content);

  // Extract client's email from the original email
  const clientEmail = parsedOriginalEmail.from.text.match(/<([^>]+)>/);
  const toEmail = clientEmail ? clientEmail[1] : ""; // Use client's email if found, otherwise empty string

  // Check if the user has a ticket id with the same subject

  const prevTickets = await prisma.tickets.findFirst({
    where:{
      AND: [
        { email: toEmail},
        { isClosed: false},
        { subject: subject},
      ]
    }
  })

  console.log(JSON.stringify(prevTickets));
  if(prevTickets)
  {
    alreadyOpenedSameTicket(email, toEmail, subject, transporter);
    return;
  }

  // Set the 'to' field with the client's email
  const idTicket = await searchAndGenerateUniqueTicketId();
  const pathLogo = path.join(__dirname, "logo.png");
  const mailOptions = {
    from: email,
    to: `${toEmail}, ${supportEmail}`,
    subject: `${parsedOriginalEmail.subject} - [Ticket #: ${idTicket}]`,
    html: `
      <img src="cid:image1" alt="Image" style="max-width: 100%;" /> <br/>
      <h3>Please reply to this email using reply all</h3>
      <p>Hello ${parsedOriginalEmail.from.value[0].name};
      <h4>Re: ${subject}</h4>
      <p>OsmoPrint | ${parsedOriginalEmail.date}</p>
      <p>For your reference, here are your case details:</p>
      <ul>
      <li>Case #: ${idTicket}</li>
      <li>Subject: ${subject}</li>
      </ul>
      <p>This message was sent to bilal@teznix.com in reference to Case #${idTicket}.</p>
      <br>
      <h4>Message sent to us:</h4>
      <p>${parsedOriginalEmail.text}</p>
      <p>Please reply to this email using reply all</p>`,
    attachments: [
      {
        filename: "logo.png", // Set the filename for the image attachment
        path: pathLogo, // Replace with the actual path to your image file
        cid: "image1", // Set the Content-ID (CID) of the image attachment
      },
      ...parsedOriginalEmail.attachments, // Include other attachments from the original email
    ],
  };
  console.log(JSON.stringify(parsedOriginalEmail.from));

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error forwarding email:", error);
    } else {
      console.log("Email forwarded:", info.response);
    }
  });

  // Create ticket in the databse

  const generatedTicket = await prisma.tickets.create({
    data: {
      date: new Date(),
      email: toEmail,
      isClosed: false,
      message: parsedOriginalEmail.text,
      name: parsedOriginalEmail.from.value[0].name, 
      subject: subject,
      ticketId: idTicket,
    }
  })

  console.log(generatedTicket);
}
