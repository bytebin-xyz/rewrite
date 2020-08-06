import { Email } from "../interfaces/email.interface";

import { renderMJML } from "@/utils/renderMJML";

export class UserActivationEmail implements Email {
  constructor(private readonly activationLink: string, private readonly displayName: string) {}

  html(): Promise<string> {
    return renderMJML("./templates/user-activation.mjml", {
      activationLink: this.activationLink,
      displayName: this.displayName
    });
  }

  subject(): string {
    return "Activate your account.";
  }

  text(): string {
    return [
      `Hey ${this.displayName},\n`,
      "To finish up the registration process, please activate your account by visiting the link below",
      "You have 7 days to activate your account before it is deleted for inactivity.\n",
      this.activationLink
    ].join("\n");
  }
}
