import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { InjectQueue } from "@nestjs/bull";

import { FilterQuery, Model } from "mongoose";
import { Queue } from "bull";

import { EmailConfirmation } from "./schemas/email-confirmation.schema";
import { PasswordReset } from "./schemas/password-reset.schema";
import { UserActivation } from "./schemas/user-activation.schema";

import { User } from "@/modules/users/schemas/user.schema";

import { settle } from "@/utils/settle";

@Injectable()
export class MailerService {
  private readonly baseURL = `http://${this.config.get("FRONTEND_DOMAIN")}`;

  constructor(
    private readonly config: ConfigService,

    @InjectModel(EmailConfirmation.name)
    private readonly emailConfirmations: Model<EmailConfirmation>,

    @InjectModel(PasswordReset.name)
    private readonly passwordResets: Model<PasswordReset>,

    @InjectModel(UserActivation.name)
    private readonly userActivations: Model<UserActivation>,

    @InjectQueue("emails")
    private readonly emailsQueue: Queue
  ) {}

  async delete(
    query: FilterQuery<EmailConfirmation & PasswordReset & UserActivation>
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

  async sendEmailChanged(user: User): Promise<void> {
    await this.emailsQueue.add("send-email-changed", {
      displayName: user.displayName,
      forgotPasswordLink: `${this.baseURL}/forgot-password`,
      to: user.email
    });
  }

  async sendEmailConfirmation(newEmail: string, user: User): Promise<void> {
    const confirmation = await new this.emailConfirmations({ newEmail, uid: user.id }).save();

    await this.emailsQueue.add("send-email-confirmation", {
      confirmEmailLink: `${this.baseURL}/confirm-email/${confirmation.token}`,
      displayName: user.displayName,
      to: newEmail
    });
  }

  async sendPasswordChanged(user: User): Promise<void> {
    await this.emailsQueue.add("send-password-changed", {
      displayName: user.displayName,
      forgotPasswordLink: `${this.baseURL}/forgot-password`,
      to: user.email
    });
  }

  async sendPasswordReset(user: User): Promise<void> {
    const reset = await new this.passwordResets({ uid: user.id }).save();

    await this.emailsQueue.add("send-password-reset", {
      displayName: user.displayName,
      resetPasswordLink: `${this.baseURL}/reset-password/${reset.token}`,
      to: user.email
    });
  }

  async sendUserActivation(user: User): Promise<void> {
    const activation = await new this.userActivations({ uid: user.id }).save();

    await this.emailsQueue.add("send-user-activation", {
      activationLink: `${this.baseURL}/activate-account/${activation.token}`,
      displayName: user.displayName,
      to: user.email
    });
  }
}
