import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { Model } from "mongoose";

import { PasswordReset } from "./interfaces/password-reset.interface";
import { UserActivation } from "./interfaces/user-activation.interface";

import { NodemailerService } from "~server/modules/nodemailer/nodemailer.service";
import { UsersService } from "~server/modules/users/users.service";

import { User } from "~/server/modules/users/interfaces/user.interface";

import { generateId } from "~/common/utils/generateId";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel("PasswordReset")
    private readonly passwordResets: Model<PasswordReset>,

    @InjectModel("UserActivation")
    private readonly userActivations: Model<UserActivation>,

    private readonly nodemailer: NodemailerService,
    private readonly users: UsersService
  ) {}

  async activate(token: string): Promise<User | void> {
    const activation = await this.userActivations.findOne({ token });
    if (!activation) return;

    const user = await this.users.findOne({ uid: activation.uid });
    if (!user) return;

    await user.activate();
    await activation.deleteOne();

    return user;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.users.findOne({ email });
    if (!user) return;

    const token = await generateId(16);

    await this.passwordResets.create({ token, uid: user.uid });
    await this.nodemailer.sendPasswordResetEmail(token, user);
  }

  login(username: string, password: string): Promise<User | null> {
    return this.users.validate(username, password);
  }

  async register(email: string, password: string, username: string): Promise<User> {
    const [token, user] = await Promise.all([
      generateId(32),
      this.users.create(email, password, username)
    ]);

    await this.userActivations.create({ token, uid: user.uid });
    await this.nodemailer.sendUserActivationEmail(token, user);

    return user;
  }

  async resendUserActivationEmail(user: User): Promise<void> {
    const activation = await this.userActivations.findOne({ uid: user.uid });
    if (activation) await this.nodemailer.sendUserActivationEmail(activation.token, user);
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const reset = await this.passwordResets.findOne({ token });
    if (!reset) return false;

    const user = await this.users.findOne({ uid: reset.uid });
    if (!user) return false;

    await user.changePassword(newPassword);
    await Promise.allSettled([this.nodemailer.sendPasswordChangedEmail(user), reset.deleteOne()]);

    return true;
  }
}
