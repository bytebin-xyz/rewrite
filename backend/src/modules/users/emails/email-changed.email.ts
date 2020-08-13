import { SendMailOptions } from "@/modules/mailer/interfaces/send-mail-options.interface";

export const emailChanged = (
  to: string,
  data: { displayName: string; link: string }
): SendMailOptions => ({
  mjml: {
    data,
    template: "./templates/email-changed.mjml"
  },
  subject: "Your email has been changed.",
  text: [
    `Hey ${data.displayName}\n`,
    "Your email has been changed.",
    "If this was not you, please reset your password immediately using the link below.\n",
    data.link
  ].join("\n"),
  to
});
