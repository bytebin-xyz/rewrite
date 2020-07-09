import fs from "fs";
import path from "path";

import { Injectable } from "@nestjs/common";

import { AVATAR_PATH } from "./settings.constants";

import { AuthService } from "@/modules/auth/auth.service";
import { NodemailerService } from "@/modules/nodemailer/nodemailer.service";
import { UsersService } from "@/modules/users/users.service";

import { User } from "@/modules/users/schemas/user.schema";

import { fileAccessibile } from "@/utils/fileAccessibile";
import { settle } from "@/utils/settle";

@Injectable()
export class SettingsService {
  constructor(
    private readonly auth: AuthService,
    private readonly nodemailer: NodemailerService,
    private readonly users: UsersService
  ) {}

  async activate(token: string): Promise<boolean> {
    const activation = await this.nodemailer.findUserActivation({ token });
    if (!activation) return false;

    const user = await this.users.findOne({ uid: activation.uid });
    if (!user) return false;

    await user.activate();
    await activation.deleteOne();

    return true;
  }

  async changeAvatar(filename: string, user: User): Promise<User> {
    if (user.avatar && (await fileAccessibile(path.join(AVATAR_PATH, user.avatar)))) {
      await fs.promises.unlink(path.join(AVATAR_PATH, user.avatar));
    }

    return user.changeAvatar(filename);
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

    if (await this.users.exists({ email: confirmation.newEmail })) {
      await confirmation.deleteOne();
      return false;
    }

    const oldUser = user.toObject();

    await user.changeEmail(confirmation.newEmail);
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

  async resendUserActivationEmail(user: User): Promise<boolean> {
    const activation = await this.nodemailer.findUserActivation({ uid: user.uid });
    if (!activation) return false;

    await this.nodemailer.sendUserActivation(user);
    await activation.resent();

    return true;
  }
}
