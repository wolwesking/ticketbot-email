// Init
const inbox = require("inbox");
const { simpleParser } = require("mailparser");
const nodemailer = require("nodemailer");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const alreadyOpenedSameTicket = require("./already");
const searchAndGenerateUniqueTicketId = require("../idGenerator");

const inboxEmail = "justdev001@outlook.com";
const inboxPassword = "CSwR747o";
const supportEmail = "takacspatrik993@gmail.com";
const NoReplyEmail = "justdev001@outlook.com";
const NoReplyPassword = "CSwR747o";

const prisma = new PrismaClient();

const client = inbox.createConnection(993, "outlook.office365.com", {
  secureConnection: true,
  auth: { user: inboxEmail, pass: inboxPassword },
});

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: NoReplyEmail,
    pass: NoReplyPassword,
  },
});

// Connecting to server
client.connect();

client.on("connect", () => {
  console.log("Connected to mail client");
  client.openMailbox("INBOX", { readOnly: true }, (error, info) => {
    // Check if connection works
    if (error) {
      console.log("error");
    } else {
      console.log("Mailbox opened: ", info);

      // Handling new messages
      client.on("new", async (message) => {
        if (!message.inReplyTo) {
          fetchEmailContentAndSubject(
            message.UID,
            async (err, { content, subject }) => {
              if (err) {
                console.error(
                  "Error fetching email and content and subject",
                  err
                );
              } else {
                // SENDING
                // Creating ticket
                const parsedOriginalEmail = await simpleParser(content);
                const clientEmail =
                  parsedOriginalEmail.from.text.match(/<([^>]+)>/);
                const toEmail = clientEmail ? clientEmail[1] : "";
                let prevTickets;
                try {
                  prevTickets = await prisma.tickets.findFirst({
                    where: {
                      AND: [
                        { email: toEmail },
                        { isClosed: false },
                        { subject: subject },
                      ],
                    },
                  });
                } catch (err) {
                  console.log(err);
                }
                console.log("PREV TICKETS: ", prevTickets);
                if (prevTickets) {
                  alreadyOpenedSameTicket(NoReplyEmail, toEmail, subject, transporter);
                  return;
                } else {
                  // Generate a new ticket ID

                  const idTicket = await searchAndGenerateUniqueTicketId();
                  // Add ticket to database
                  try {
                    const query = await prisma.tickets.create({
                      data: {
                        date: new Date(),
                        email: toEmail,
                        isClosed: false,
                        message: parsedOriginalEmail.text,
                        name: parsedOriginalEmail.from.value[0].name,
                        subject: subject,
                        ticketId: idTicket,
                      },
                    });
                    console.log("QUERY: ", JSON.stringify(query));
                  } catch (err) {
                    console.log(err);
                  }
                  const pathLogo = path.join(__dirname, "logo.png");
                  const newSubject = `${parsedOriginalEmail.subject} - [Ticket #: ${idTicket}]`
                  // EmailFor
                  const EmailForCleint = {
                    from: NoReplyEmail,
                    to: `${toEmail}`,
                    subject: newSubject,
                    html: `
                      <img src="cid:image1" alt="Image" style="max-width: 100%;" /> <br/>
                      <h3>Please do not reply to this email, this mailbox is not monitored</h3>
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
                      <p>Please do not reply to this email, this mailbox is not monitored</p>`,
                    attachments: [
                      {
                        filename: "logo.png", // Set the filename for the image attachment
                        path: pathLogo, // Replace with the actual path to your image file
                        cid: "image1", // Set the Content-ID (CID) of the image attachment
                      },
                      ...parsedOriginalEmail.attachments, // Include other attachments from the original email
                    ],
                  };

                  const replySubject = replySubjectFormater(newSubject);

                  const EmailForSupport = {
                    from: NoReplyEmail,
                    to: `${supportEmail}`,
                    subject: `NEW TICKET - ${parsedOriginalEmail.subject} - [Ticket #: ${idTicket}]`,
                    html: `
                        <p>Sent from: ${toEmail}</p>
                        <p>Name: ${parsedOriginalEmail.from.value[0].name};
                        <p>Date: ${parsedOriginalEmail.date}</p>
                        <ul>
                        <li>Case #: ${idTicket}</li>
                        <li>Subject: ${subject}</li>
                        </ul>
                        <h4>Message sent to us:</h4>
                        <p>${parsedOriginalEmail.text}</p>
                        <p>Please do not reply to this email, this mailbox is not monitored</p>
                        <a href="mailto:${toEmail}?subject=${replySubject}">Reply</a>`,
                    attachments: parsedOriginalEmail.attachments, // Include other attachments from the original email
                  };
                  // Send email for client

                  transporter.sendMail(EmailForCleint, (error, info) => {
                    if (error) {
                      console.error("Error forwarding email:", error);
                    } else {
                      console.log("Email forwarded:", info.response);
                    }
                    transporter.sendMail(EmailForSupport, (error, info) => {
                      if (error) {
                        console.error("Error forwarding email:", error);
                      } else {
                        console.log("Email forwarded:", info.response);
                      }
                    });
                  });
                }
              }
            }
          );
        } else {
          console.log("It's a reply. SKIP!");
        }
      });
      client.idle();
      prisma.$disconnect();
    }
  });
  //
});

client.on("close", () => {
  console.log("Connection closed");
});

client.on("error", (error) => {
  console.error("Error:", error);
});

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

function replySubjectFormater(Subject) {
  return encodeURIComponent(Subject);
}
