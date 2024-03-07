const inbox = require("inbox");
const { simpleParser } = require("mailparser");
const nodemailer = require("nodemailer");
const generateRandomNumber = require("../idGenerator");
require("dotenv").config();

const email = process.env.EMAIL_1;
const password = process.env.PASSWORD_1;
const supportEmail = process.env.SUPPORT_EMAIL_1;

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

  // Set the 'to' field with the client's email
  const idTicket = generateRandomNumber();
  const mailOptions = {
    from: email,
    to: `${toEmail}, ${supportEmail}`,
    subject: `${parsedOriginalEmail.subject} - [Ticket #: ${idTicket}]`,
    text: `Original Sender: ${parsedOriginalEmail.from.text}\n\n${parsedOriginalEmail.text}\nPlease use reply all!!`,
    attachments: parsedOriginalEmail.attachments,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error forwarding email:", error);
    } else {
      console.log("Email forwarded:", info.response);
    }
  });
}
