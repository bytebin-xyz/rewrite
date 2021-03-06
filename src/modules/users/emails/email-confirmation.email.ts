import { SendMailOptions } from "@/modules/mailer/interfaces/send-mail-options.interface";

import { config } from "@/config";

export const emailConfirmation = (
  to: string,
  data: { displayName: string; link: string }
): SendMailOptions => ({
  mjml: {
    data,
    template: "./templates/email-confirmation.mjml"
  },
  subject: `${config.get("branding")} - Please confirm your email address`,
  text: [
    `Hey ${data.displayName}\n`,
    "To confirm your email address, please visit the link below.",
    "This email confirmation link is only valid for the next 72 hours.\n",
    data.link
  ].join("\n"),
  to
});
