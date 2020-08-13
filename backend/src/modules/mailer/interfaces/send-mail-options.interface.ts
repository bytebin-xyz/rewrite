import fs from "fs";

import Mail from "nodemailer/lib/mailer";

export interface SendMailOptions extends Mail.Options {
  mjml?: {
    data?: Record<string, unknown>;
    template: fs.PathLike;
  };
}
