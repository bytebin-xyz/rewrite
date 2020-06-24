import SMTPTransport = require("nodemailer/lib/smtp-transport");

export interface NodemailerTransporterOptions extends SMTPTransport.Options {}
