import { SendMailOptions } from "@/modules/mailer/interfaces/send-mail-options.interface";

export const userActivation = (
  to: string,
  data: { displayName: string; link: string }
): SendMailOptions => ({
  mjml: {
    data,
    template: "./templates/user-activation.mjml"
  },
  subject: "Activate your account.",
  text: [
    `Hey ${data.displayName},\n`,
    "To finish up the registration process, please activate your account by visiting the link below",
    "You have 7 days to activate your account before it is deleted for inactivity.\n",
    data.link
  ].join("\n"),
  to
});
