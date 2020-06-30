import { Injectable } from "@nestjs/common";

import { AuthService } from "~server/modules/auth/auth.service";
import { NodemailerService } from "~server/modules/nodemailer/nodemailer.service";
import { UsersService } from "~server/modules/users/users.service";

import { User } from "~server/modules/users/interfaces/user.interface";

import { settle } from "~/common/utils/settle";

@Injectable()
export class SettingsService {
  constructor(
    private readonly auth: AuthService,
    private readonly nodemailer: NodemailerService,
    private readonly users: UsersService
  ) {}

  async activate(token: string): Promise<User | void> {
    const activation = await this.nodemailer.findUserActivation({ token });
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
    await this.nodemailer.sendPasswordChanged(user);
  }

  async confirmEmail(token: string): Promise<boolean> {
    const confirmation = await this.nodemailer.findEmailConfirmation({ token });
    if (!confirmation) return false;

    const user = await this.users.findOne({ uid: confirmation.uid });
    if (!user) return false;

    if (await this.users.exists({ email: confirmation.new_email })) {
      await confirmation.deleteOne();
      return false;
    }

    const oldUser = user.toObject();

    await user.changeEmail(confirmation.new_email);
    await settle([confirmation.deleteOne(), this.nodemailer.sendEmailChanged(oldUser)]);

    return true;
  }

  async deleteAccount(user: User): Promise<void> {
    await settle([
      this.auth.logoutAllDevices(user),
      this.nodemailer.deleteAllFor({ uid: user.uid })
    ]);

    await user.delete();
  }

  async resendUserActivationEmail(user: User): Promise<void> {
    const activation = await this.nodemailer.findUserActivation({ uid: user.uid });

    if (activation && !activation.resendAttemptsExceeded) {
      await this.nodemailer.sendUserActivation(user);
      await activation.resent();
    }
  }
}
