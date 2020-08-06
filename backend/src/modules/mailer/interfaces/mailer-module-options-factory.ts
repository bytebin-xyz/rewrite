import { MailerOptions } from "./mailer-module-options.interface";

export interface MailerOptionsFactory {
  createMailerOptions(): Promise<MailerOptions> | MailerOptions;
}
