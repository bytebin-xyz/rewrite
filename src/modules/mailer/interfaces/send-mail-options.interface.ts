import { PathLike } from "fs";

import { Options } from "nodemailer/lib/mailer";

export interface SendMailOptions extends Options {
  mjml?: {
    data?: Record<string, unknown>;
    template: PathLike;
  };
}
