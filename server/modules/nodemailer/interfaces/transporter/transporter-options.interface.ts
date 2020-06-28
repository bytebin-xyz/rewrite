import SMTPTransport = require("nodemailer/lib/smtp-transport");

export interface TransporterOptions extends SMTPTransport.Options {}
