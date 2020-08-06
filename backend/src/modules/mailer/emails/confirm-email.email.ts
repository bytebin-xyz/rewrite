import { Email } from "../interfaces/email.interface";

import { renderMJML } from "@/utils/renderMJML";

export class EmailConfirmationEmail implements Email {
  constructor(private readonly confirmEmailLink: string, private readonly displayName: string) {}

  html(): Promise<string> {
    return renderMJML("./templates/email-confirmation.mjml", {
      confirmEmailLink: this.confirmEmailLink,
      displayName: this.displayName
    });
  }

  subject(): string {
    return "Please confirm your email address.";
  }

  text(): string {
    return [
      `Hey ${this.displayName}\n`,
      "To confirm your email address, please visit the link below.",
      "This email confirmation link is only valid for the next 72 hours.\n",
      this.confirmEmailLink
    ].join("\n");
  }
}
