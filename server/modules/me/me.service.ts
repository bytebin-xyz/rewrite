import { Injectable } from "@nestjs/common";

import { NodemailerService } from "~server/modules/nodemailer/nodemailer.service";
import { UsersService } from "~server/modules/users/users.service";
import { User } from "~server/modules/users/interfaces/user.interface";

@Injectable()
export class MeService {
  constructor(
    private readonly nodemailer: NodemailerService,
    private readonly users: UsersService
  ) {}

  async activate(token: string): Promise<User | void> {
    const activation = await this.nodemailer.findUserActivation(token);
    if (!activation) return;

    const user = await this.users.findOne({ uid: activation.uid });
    if (!user) return;

    await user.activate();
    await activation.deleteOne();

    return user;
  }

  async changeEmail(newEmail: string, user: User): Promise<void> {
    await this.nodemailer.sendEmailConfirmation(newEmail, user);
  }

  async changePassword(newPassword: string, user: User): Promise<void> {
    await user.changePassword(newPassword);
    await this.nodemailer.sendPasswordChangedEmail(user);
  }

  async confirmEmail(token: string): Promise<boolean> {
    const confirmation = await this.nodemailer.findEmailConfirmation(token);
    if (!confirmation) return false;

    const user = await this.users.findOne({ uid: confirmation.uid });
    if (!user) return false;

    await user.changeEmail(confirmation.new_email);
    await confirmation.deleteOne();

    return true;
  }

  async deleteUser(user: User): Promise<void> {
    await this.nodemailer.deleteAll(user.uid);
    await user.delete();
  }

  async resendUserActivationEmail(user: User): Promise<void> {
    const activation = await this.nodemailer.findUserActivation(user.uid);

    if (activation && !activation.resendAttemptsExceeded) {
      await this.nodemailer.sendUserActivationEmail(user);
      await activation.resent();
    }
  }
}
