import { SendMailOptions } from "@/modules/mailer/interfaces/send-mail-options.interface";

import { config } from "@/config";

export const passwordResetted = (
  to: string,
  data: { displayName: string; link: string }
): SendMailOptions => ({
  mjml: {
    data,
    template: "./templates/password-post-reset.mjml"
  },
  subject: `${config.get("branding")} - Your password has been reset`,
  text: [
    `Hey ${data.displayName},\n`,
    "Your password has been reset.",
    "If this was not you, please reset your password immediately using the link below.\n",
    data.link
  ].join("\n"),
  to
});
