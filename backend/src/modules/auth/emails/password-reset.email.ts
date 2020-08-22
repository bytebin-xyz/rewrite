import { SendMailOptions } from "@/modules/mailer/interfaces/send-mail-options.interface";

export const passwordReset = (
  to: string,
  data: { displayName: string; link: string }
): SendMailOptions => ({
  mjml: {
    data,
    template: "./templates/password-reset.mjml"
  },
  subject: "Bytebin - Password reset requested",
  text: [
    `Hey ${data.displayName},\n`,
    "To reset your password, please visit the link below.",
    "This password reset link is only valid for the next 1 hour.\n",
    data.link
  ].join("\n"),
  to
});
