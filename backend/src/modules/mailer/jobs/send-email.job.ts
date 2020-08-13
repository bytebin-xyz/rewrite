import Mail from "nodemailer/lib/mailer";

export interface SendEmailJob {
  options: Mail.Options;
}
