import * as path from "path";

import nodemailer from "nodemailer";

import { ConfigService } from "@nestjs/config";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";

import { NODEMAILER_TRANSPORTER_OPTIONS } from "./nodemailer.constants";

import { NodemailerTransporterOptions } from "./interfaces";

import { User } from "~/server/modules/users/interfaces/user.interface";

import { renderMJML } from "~/common/utils/renderMJML";

import Mail = require("nodemailer/lib/mailer");

@Injectable()
export class NodemailerService implements OnModuleInit {
  private readonly baseURL = `http://${this.config.get("DOMAIN")}`;
  private readonly transporter: Mail;

  constructor(
    private readonly config: ConfigService,

    @Inject(NODEMAILER_TRANSPORTER_OPTIONS)
    private readonly transporterOptions: NodemailerTransporterOptions
  ) {
    this.transporter = nodemailer.createTransport(this.transporterOptions, {
      from: `Bytebin <${this.transporterOptions.from}>`
    });
  }

  async onModuleInit(): Promise<void> {
    await this.verify();
  }

  async send(options: { html: string; subject: string; text: string; to: string }): Promise<void> {
    await this.verify();
    await this.transporter.sendMail(options);
  }

  async sendEmailConfirmation(token: string, user: User) {
    const confirmEmailLink = `${this.baseURL}/settings/confirm-email/${token}`;
    const html = await renderMJML(path.join(__dirname, "./mjml/email-confirmation.mjml"), {
      confirmEmailLink,
      username: user.username
    });

    await this.send({
      html,
      subject: "Please confirm your email address.",
      text: [
        `Hey @${user.username}\n`,
        "Your password has been changed.",
        "If this was not you, please reset your password immediately using the link below.",
        confirmEmailLink
      ].join("\n"),
      to: user.email
    });
  }

  async sendPasswordChangedEmail(user: User) {
    const forgotPasswordLink = `${this.baseURL}/forgot-password`;
    const html = await renderMJML(path.join(__dirname, "./mjml/password-changed.mjml"), {
      forgotPasswordLink,
      username: user.username
    });

    await this.send({
      html,
      subject: "Your password has been changed.",
      text: [
        `Hey @${user.username}\n`,
        "Your password has been changed.",
        "If this was not you, please reset your password immediately using the link below.",
        forgotPasswordLink
      ].join("\n"),
      to: user.email
    });
  }

  async sendPasswordResetEmail(token: string, user: User) {
    const resetPasswordLink = `${this.baseURL}/auth/reset-password/${token}`;
    const html = await renderMJML(path.join(__dirname, "./mjml/password-reset.mjml"), {
      resetPasswordLink,
      username: user.username
    });

    await this.send({
      html,
      subject: "Password Reset",
      text: [
        `Hey @${user.username},\n`,
        "To reset your password, please visit the link below.",
        `${resetPasswordLink}\n`,
        "This link will expire is 3 hours."
      ].join("\n"),
      to: user.email
    });
  }

  async sendUserActivationEmail(token: string, user: User) {
    const activationLink = `${this.baseURL}/auth/activate/${token}`;
    const html = await renderMJML(path.join(__dirname, "./mjml/user-activation.mjml"), {
      activationLink,
      username: user.username
    });

    await this.send({
      html,
      subject: "Activate your account.",
      text: [
        `Hey @${user.username},\n`,
        "Please activate your account by visiting the link below.",
        `${activationLink}\n`,
        "This link will expire in 3 days."
      ].join("\n"),
      to: user.email
    });
  }

  async verify(): Promise<void> {
    await this.transporter.verify();
  }
}
