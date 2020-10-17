import { SendMailOptions } from "@/modules/mailer/interfaces/send-mail-options.interface";

import { config } from "@/config";

export const passwordReset = (
  to: string,
  data: { displayName: string; link: string }
): SendMailOptions => ({
  mjml: {
    data,
    template: "./templates/password-reset-request.mjml"
  },
  subject: `${config.get("branding")} - Password reset requested`,
  text: [
    `Hey ${data.displayName},\n`,
    "To reset your password, please visit the link below.",
    "This password reset link is only valid for the next 1 hour.\n",
    data.link
  ].join("\n"),
  to
});
