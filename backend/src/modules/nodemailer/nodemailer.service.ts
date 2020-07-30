import nodemailer from "nodemailer";
import path from "path";

import { ConfigService } from "@nestjs/config";
import { Inject, Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { FilterQuery, Model } from "mongoose";

import { NODEMAILER_TRANSPORTER_OPTIONS } from "./nodemailer.constants";

import { SendMailOptions } from "./interfaces/send-mail-options.interface";
import { TransporterOptions } from "./interfaces/transporter-options.interface";

import { EmailConfirmation } from "./schemas/email-confirmation.schema";
import { PasswordReset } from "./schemas/password-reset.schema";
import { UserActivation } from "./schemas/user-activation.schema";

import { User } from "@/modules/users/schemas/user.schema";

import { renderMJML } from "@/utils/renderMJML";
import { settle } from "@/utils/settle";

@Injectable()
export class NodemailerService implements OnApplicationBootstrap {
  private readonly baseURL = `http://${this.config.get("FRONTEND_DOMAIN")}`;

  private readonly transporter = nodemailer.createTransport(this.transporterOptions, {
    from: `Bytebin <${this.transporterOptions.from}>`
  });

  constructor(
    @Inject(NODEMAILER_TRANSPORTER_OPTIONS)
    private readonly transporterOptions: TransporterOptions,

    @InjectModel(EmailConfirmation.name)
    private readonly emailConfirmations: Model<EmailConfirmation>,

    @InjectModel(PasswordReset.name)
    private readonly passwordResets: Model<PasswordReset>,

    @InjectModel(UserActivation.name)
    private readonly userActivations: Model<UserActivation>,

    private readonly config: ConfigService
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.verify();
  }

  async deleteAllFor(uid: string): Promise<void> {
    await settle([
      this.emailConfirmations.deleteMany({ uid }),
      this.passwordResets.deleteMany({ uid }),
      this.userActivations.deleteMany({ uid })
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

  async sendEmailChanged(user: User): Promise<void> {
    const forgotPasswordLink = `${this.baseURL}/forgot-password`;
    const html = await renderMJML(path.join(__dirname, "./mjml/email-changed.mjml"), {
      displayName: user.displayName,
      forgotPasswordLink
    });

    await this.send({
      html,
      subject: "Your email has been changed.",
      text: [
        `Hey ${user.displayName}\n`,
        "Your email has been changed.",
        "If this was not you, please reset your password immediately using the link below.\n",
        forgotPasswordLink
      ].join("\n"),
      to: user.email
    });
  }

  async sendEmailConfirmation(newEmail: string, user: User): Promise<void> {
    const confirmation = await new this.emailConfirmations({ newEmail, uid: user.id }).save();
    const confirmEmailLink = `${this.baseURL}/confirm-email/${confirmation.token}`;
    const html = await renderMJML(path.join(__dirname, "./mjml/email-confirmation.mjml"), {
      confirmEmailLink,
      displayName: user.displayName
    });

    await this.send({
      html,
      subject: "Please confirm your email address.",
      text: [
        `Hey ${user.displayName}\n`,
        "To confirm your email address, please visit the link below.",
        "This email confirmation link is only valid for the next 72 hours.\n",
        confirmEmailLink
      ].join("\n"),
      to: newEmail
    });
  }

  async sendPasswordChanged(user: User): Promise<void> {
    const forgotPasswordLink = `${this.baseURL}/forgot-password`;
    const html = await renderMJML(path.join(__dirname, "./mjml/password-changed.mjml"), {
      displayName: user.displayName,
      forgotPasswordLink
    });

    await this.send({
      html,
      subject: "Your password has been changed.",
      text: [
        `Hey ${user.displayName}\n`,
        "Your password has been changed.",
        "If this was not you, please reset your password immediately using the link below.\n",
        forgotPasswordLink
      ].join("\n"),
      to: user.email
    });
  }

  async sendPasswordReset(user: User): Promise<void> {
    const reset = await new this.passwordResets({ uid: user.id }).save();
    const resetPasswordLink = `${this.baseURL}/reset-password/${reset.token}`;
    const html = await renderMJML(path.join(__dirname, "./mjml/password-reset.mjml"), {
      displayName: user.displayName,
      resetPasswordLink
    });

    await this.send({
      html,
      subject: "Password Reset",
      text: [
        `Hey ${user.displayName},\n`,
        "To reset your password, please visit the link below.",
        "This password reset link is only valid for the next 1 hour.\n",
        resetPasswordLink
      ].join("\n"),
      to: user.email
    });
  }

  async sendUserActivation(user: User): Promise<void> {
    const activation = await new this.userActivations({ uid: user.id }).save();
    const activationLink = `${this.baseURL}/activate-account/${activation.token}`;
    const html = await renderMJML(path.join(__dirname, "./mjml/user-activation.mjml"), {
      activationLink,
      displayName: user.displayName
    });

    await this.send({
      html,
      subject: "Activate your account.",
      text: [
        `Hey ${user.displayName},\n`,
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
