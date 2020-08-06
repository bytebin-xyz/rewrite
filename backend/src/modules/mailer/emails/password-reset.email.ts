import { Email } from "../interfaces/email.interface";

import { renderMJML } from "@/utils/renderMJML";

export class PasswordResetEmail implements Email {
  constructor(private readonly resetPasswordLink: string, private readonly displayName: string) {}

  html(): Promise<string> {
    return renderMJML("./templates/password-reset.mjml", {
      displayName: this.displayName,
      resetPasswordLink: this.resetPasswordLink
    });
  }

  subject(): string {
    return "Password Reset Requested.";
  }

  text(): string {
    return [
      `Hey ${this.displayName},\n`,
      "To reset your password, please visit the link below.",
      "This password reset link is only valid for the next 1 hour.\n",
      this.resetPasswordLink
    ].join("\n");
  }
}
