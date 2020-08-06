import SMTPTransport = require("nodemailer/lib/smtp-transport");

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MailerOptions extends SMTPTransport.Options {}
