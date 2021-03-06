import { SendMailOptions } from "@/modules/mailer/interfaces/send-mail-options.interface";

import { Session } from "@/interfaces/session.interface";

import { config } from "@/config";

export const successfulLogin = (
  to: string,
  data: {
    displayName: string;
    link: string;
    session: Session;
  }
): SendMailOptions => {
  const time = new Date().toUTCString();

  return {
    mjml: {
      data: {
        ...data,
        time
      },
      template: "./templates/successful-login.mjml"
    },
    subject: `${config.get("branding")} - Successful Login`,
    text: [
      `Hey ${data.displayName},\n`,
      `This email was sent because a new login has occurred on your account at ${time}.\n`,
      `IP Address: ${data.session.ip || "Unknown"}`,
      `Device: ${data.session.ua.os.name} ${data.session.ua.os.version}`,
      `Browser: ${data.session.ua.browser.name} ${data.session.ua.browser.version}\n`,
      "If this was not you, please reset your password immediately using the link below.\n",
      data.link
    ].join("\n"),
    to
  };
};
