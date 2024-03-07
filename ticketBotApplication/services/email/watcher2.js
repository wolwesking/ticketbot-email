require('dotenv').config()
const authData = {
    email: process.env.EMAIL_1,
    passowrd: process.env.PASSWORD_1,
    supportEmail: process.env.SUPPORT_EMAIL_1,
    imapPort: parseInt(process.env.IMAP_PORT_1),
    imapProvider: process.env.IMAP_PROVIDER_1,
    imapSecure: process.env.SMTP_SECURE_1 === 'true',
    smtpProvider: process.env.SMTP_PROVIDER_1,
    smtpPort: parseInt(process.env.SMTP_PORT_1),
    smtpSecure: process.env.SMTP_SECURE_1 === 'true',
}

console.log(authData);
