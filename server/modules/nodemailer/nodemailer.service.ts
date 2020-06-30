import * as path from "path";

import nodemailer from "nodemailer";

import { ConfigService } from "@nestjs/config";
import { Inject, Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { FilterQuery, Model } from "mongoose";

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

@Injectable()
export class NodemailerService implements OnApplicationBootstrap {
  private readonly baseURL = `http://${this.config.get("DOMAIN")}`;

  private readonly transporter = nodemailer.createTransport(this.transporterOptions, {
    from: `Bytebin <${this.transporterOptions.from}>`
  });

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
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.verify();
  }

  async deleteAllFor(
    query: FilterQuery<EmailConfirmation | PasswordReset | UserActivation>
  ): Promise<void> {
    await settle([
      this.emailConfirmations.deleteMany(query),
      this.passwordResets.deleteMany(query),
      this.userActivations.deleteMany(query)
    ]);
  }

  async findEmailConfirmation(
    query: FilterQuery<EmailConfirmation>
  ): Promise<EmailConfirmation | null> {
    return this.emailConfirmations.findOne(query);
  }

  async findPasswordReset(query: FilterQuery<PasswordReset>): Promise<PasswordReset | null> {
    return this.passwordResets.findOne(query);
  }

  async findUserActivation(query: FilterQuery<UserActivation>): Promise<UserActivation | null> {
    return this.userActivations.findOne(query);
  }

  async send(options: SendMailOptions): Promise<void> {
    await this.transporter.sendMail(options);
  }

  async sendEmailChanged(user: User) {
    const forgotPasswordLink = `${this.baseURL}/forgot-password`;
    const html = await renderMJML(path.join(__dirname, "./mjml/email-changed.mjml"), {
      displayName: user.display_name,
      forgotPasswordLink
    });

    await this.send({
      html,
      subject: "Your email has been changed.",
      text: [
        `Hey ${user.display_name}\n`,
        "Your email has been changed.",
        "If this was not you, please reset your password immediately using the link below.\n",
        forgotPasswordLink
      ].join("\n"),
      to: user.email
    });
  }

  async sendEmailConfirmation(newEmail: string, user: User) {
    const token = await generateId(32);
    const confirmEmailLink = `${this.baseURL}/settings/confirm-email/${token}`;

    await this.emailConfirmations.create({ new_email: newEmail, token, uid: user.uid });

    const html = await renderMJML(path.join(__dirname, "./mjml/email-confirmation.mjml"), {
      confirmEmailLink,
      displayName: user.display_name
    });

    await this.send({
      html,
      subject: "Please confirm your email address.",
      text: [
        `Hey ${user.display_name}\n`,
        "To confirm your email address, please visit the link below.",
        "This email confirmation link is only valid for the next 72 hours.\n",
        confirmEmailLink
      ].join("\n"),
      to: newEmail
    });
  }

  async sendPasswordChanged(user: User) {
    const forgotPasswordLink = `${this.baseURL}/forgot-password`;
    const html = await renderMJML(path.join(__dirname, "./mjml/password-changed.mjml"), {
      displayName: user.display_name,
      forgotPasswordLink
    });

    await this.send({
      html,
      subject: "Your password has been changed.",
      text: [
        `Hey ${user.display_name}\n`,
        "Your password has been changed.",
        "If this was not you, please reset your password immediately using the link below.\n",
        forgotPasswordLink
      ].join("\n"),
      to: user.email
    });
  }

  async sendPasswordReset(user: User) {
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
        `Hey ${user.display_name},\n`,
        "To reset your password, please visit the link below.",
        "This password reset link is only valid for the next 3 hours.\n",
        resetPasswordLink
      ].join("\n"),
      to: user.email
    });
  }

  async sendUserActivation(user: User) {
    const token = await generateId(32);
    const activationLink = `${this.baseURL}/settings/activate/${token}`;

    await this.userActivations.create({ token, uid: user.uid });

    const html = await renderMJML(path.join(__dirname, "./mjml/user-activation.mjml"), {
      activationLink,
      displayName: user.display_name
    });

    await this.send({
      html,
      subject: "Activate your account.",
      text: [
        `Hey ${user.display_name},\n`,
        "To finish up the registration process, please activate your account by visiting the link below",
        "You have 7 days to activate your account before it is deleted for inactivity.\n",
        activationLink
      ].join("\n"),
      to: user.email
    });
  }

  async verify(): Promise<void> {
    await this.transporter.verify();
  }
}
