function alreadyOpenedSameTicket(email, toEmail, subject, transporter) {
  const mailOptions = {
    from: email,
    to: `${toEmail}`,
    subject: `${subject} - declined`,
    html: `<h1>You already have an open ticket with us under the same subject</h1>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error forwarding email:", error);
    } else {
      console.log("Email forwarded:", info.response);
    }
  });

  console.log("Ticket already Exists");
}

module.exports = alreadyOpenedSameTicket;