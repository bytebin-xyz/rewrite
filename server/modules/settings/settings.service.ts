import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { Model } from "mongoose";

import { EmailConfirmation } from "./interfaces/email-confirmation.interface";

import { NodemailerService } from "~server/modules/nodemailer/nodemailer.service";
import { UsersService } from "~server/modules/users/users.service";

import { User } from "~server/modules/users/interfaces/user.interface";

import { generateId } from "~/common/utils/generateId";

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel("EmailConfirmation")
    private readonly emailConfirmations: Model<EmailConfirmation>,

    private readonly nodemailer: NodemailerService,
    private readonly users: UsersService
  ) {}

  async changeEmail(user: User, newEmail: string): Promise<void> {
    const token = await generateId(32);

    await this.emailConfirmations.create({ new_email: newEmail, token, uid: user.uid });
    await this.nodemailer.sendEmailConfirmation(token, user);
  }

  async changePassword(user: User, newPassword: string): Promise<void> {
    await user.changePassword(newPassword);
    await this.nodemailer.sendPasswordChangedEmail(user);
  }

  async confirmEmail(token: string): Promise<boolean> {
    const confirmation = await this.emailConfirmations.findOne({ token });
    if (!confirmation) return false;

    const user = await this.users.findOne({ uid: confirmation.uid });
    if (!user) return false;

    await user.changeEmail(confirmation.new_email);
    await confirmation.deleteOne();

    return true;
  }
}
