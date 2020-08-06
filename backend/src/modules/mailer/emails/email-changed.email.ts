import { Email } from "../interfaces/email.interface";

import { renderMJML } from "@/utils/renderMJML";

export class EmailChangedEmail implements Email {
  constructor(private readonly forgotPasswordLink: string, private readonly displayName: string) {}

  html(): Promise<string> {
    return renderMJML("./templates/email-confirmation.mjml", {
      displayName: this.displayName,
      forgotPasswordLink: this.forgotPasswordLink
    });
  }

  subject(): string {
    return "Your email has been changed.";
  }

  text(): string {
    return [
      `Hey ${this.displayName}\n`,
      "Your email has been changed.",
      "If this was not you, please reset your password immediately using the link below.\n",
      this.forgotPasswordLink
    ].join("\n");
  }
}
