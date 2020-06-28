import * as path from "path";

import nodemailer from "nodemailer";

import { ConfigService } from "@nestjs/config";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { Model } from "mongoose";

import { NODEMAILER_TRANSPORTER_OPTIONS } from "./nodemailer.constants";

import { EmailConfirmation } from "./interfaces/email-confirmation.interface";
import { PasswordReset } from "./interfaces/password-reset.interface";
import { UserActivation } from "./interfaces/user-activation.interface";

import { SendMailOptions } from "./interfaces/send-mail-options.interface";
import { TransporterOptions } from "./interfaces/transporter-options.interface";

import { User } from "~/server/modules/users/interfaces/user.interface";

import { generateId } from "~/common/utils/generateId";
import { renderMJML } from "~/common/utils/renderMJML";
import { settle } from "~common/utils/settle";

import Mail = require("nodemailer/lib/mailer");

@Injectable()
export class NodemailerService implements OnModuleInit {
  private readonly baseURL = `http://${this.config.get("DOMAIN")}`;
  private readonly transporter: Mail;

  constructor(
    @Inject(NODEMAILER_TRANSPORTER_OPTIONS)
    private readonly transporterOptions: TransporterOptions,

    @InjectModel("EmailConfirmation")
    private readonly emailConfirmations: Model<EmailConfirmation>,

    @InjectModel("PasswordReset")
    private readonly passwordResets: Model<PasswordReset>,

    @InjectModel("UserActivation")
    private readonly userActivations: Model<UserActivation>,

    private readonly config: ConfigService
  ) {
    this.transporter = nodemailer.createTransport(this.transporterOptions, {
      from: `Bytebin <${this.transporterOptions.from}>`
    });
  }

  async onModuleInit(): Promise<void> {
    await this.verify();
  }

  deleteAll(uid: string) {
    return settle([
      this.emailConfirmations.deleteMany({ uid }),
      this.passwordResets.deleteMany({ uid }),
      this.userActivations.deleteMany({ uid })
    ]);
  }

  async findEmailConfirmation(token: string): Promise<EmailConfirmation | null> {
    return this.emailConfirmations.findOne({ token });
  }

  async findPasswordReset(token: string): Promise<PasswordReset | null> {
    return this.passwordResets.findOne({ token });
  }

  async findUserActivation(token: string): Promise<UserActivation | null> {
    return this.userActivations.findOne({ token });
  }

  async send(options: SendMailOptions): Promise<void> {
    await this.verify();
    await this.transporter.sendMail(options);
  }

  async sendEmailConfirmation(newEmail: string, user: User) {
    const token = await generateId(32);
    const confirmEmailLink = `${this.baseURL}/me/confirm-email/${token}`;

    await this.emailConfirmations.create({ new_email: newEmail, token, uid: user.uid });

    const html = await renderMJML(path.join(__dirname, "./mjml/email-confirmation.mjml"), {
      confirmEmailLink,
      displayName: user.display_name
    });

    await this.send({
      html,
      subject: "Please confirm your email address.",
      text: [
        `Hey @${user.display_name}\n`,
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
      displayName: user.display_name,
      forgotPasswordLink
    });

    await this.send({
      html,
      subject: "Your password has been changed.",
      text: [
        `Hey @${user.display_name}\n`,
        "Your password has been changed.",
        "If this was not you, please reset your password immediately using the link below.",
        forgotPasswordLink
      ].join("\n"),
      to: user.email
    });
  }

  async sendPasswordResetEmail(user: User) {
    const token = await generateId(32);
    const resetPasswordLink = `${this.baseURL}/reset-password/${token}`;

    await this.passwordResets.create({ token, uid: user.uid });

    const html = await renderMJML(path.join(__dirname, "./mjml/password-reset.mjml"), {
      displayName: user.display_name,
      resetPasswordLink
    });

    await this.send({
      html,
      subject: "Password Reset",
      text: [
        `Hey @${user.display_name},\n`,
        "To reset your password, please visit the link below.",
        `${resetPasswordLink}\n`,
        "This link will expire is 3 hours."
      ].join("\n"),
      to: user.email
    });
  }

  async sendUserActivationEmail(user: User) {
    const token = await generateId(32);
    const activationLink = `${this.baseURL}/me/activate/${token}`;

    await this.userActivations.create({ token, uid: user.uid });

    const html = await renderMJML(path.join(__dirname, "./mjml/user-activation.mjml"), {
      activationLink,
      displayName: user.display_name
    });

    await this.send({
      html,
      subject: "Activate your account.",
      text: [
        `Hey @${user.display_name},\n`,
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
