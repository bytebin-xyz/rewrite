import { SendMailOptions } from "@/modules/mailer/interfaces/send-mail-options.interface";

import { config } from "@/config";

export const passwordChangedEmail = (
  to: string,
  data: { displayName: string; link: string }
): SendMailOptions => ({
  mjml: {
    data,
    template: "./templates/password-changed.mjml"
  },
  subject: `${config.get("branding")} - Password Changed`,
  text: [
    `Hey ${data.displayName}\n`,
    "Your password has been changed.",
    "If this was not you, please reset your password immediately using the link below.\n",
    data.link
  ].join("\n"),
  to
});
