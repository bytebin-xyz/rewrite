import { Injectable } from "@nestjs/common";

import { AuthService } from "@/modules/auth/auth.service";
import { FilesService } from "@/modules/files/files.service";
import { MailerService } from "@/modules/mailer/mailer.service";
import { UsersService } from "@/modules/users/users.service";

import { InvalidEmailConfirmationLink, InvalidUserActivationLink } from "./settings.errors";

import {
  DisplayNameAlreadyExists,
  EmailAlreadyExists,
  UserNotFound
} from "@/modules/users/users.errors";

import { IncorrectPassword } from "@/modules/auth/auth.errors";

import { User } from "@/modules/users/schemas/user.schema";

import { settle } from "@/utils/settle";

@Injectable()
export class SettingsService {
  constructor(
    private readonly auth: AuthService,
    private readonly files: FilesService,
    private readonly mailer: MailerService,
    private readonly users: UsersService
  ) {}

  async activate(token: string): Promise<void> {
    const activation = await this.mailer.findUserActivation({ token });
    if (!activation) throw new InvalidUserActivationLink();

    const user = await this.users.findOne({ id: activation.uid });
    if (!user) throw new InvalidUserActivationLink();

    await user.activate();
    await activation.deleteOne();
  }

  async changeAvatar(newAvatarId: string, user: User): Promise<User> {
    if (user.avatar) {
      await this.files.delete(user.avatar, user.id).catch(() => undefined);
    }

    await user.changeAvatar(newAvatarId);

    return user;
  }

  async changeDisplayName(newDisplayName: string, user: User): Promise<User> {
    if (await this.users.exists({ displayName: newDisplayName })) {
      throw new DisplayNameAlreadyExists(newDisplayName);
    }

    return user.changeDisplayName(newDisplayName);
  }

  async changeEmail(newEmail: string, user: User): Promise<void> {
    if (await this.users.exists({ email: newEmail })) {
      throw new EmailAlreadyExists(newEmail);
    }

    await this.mailer.sendEmailConfirmation(newEmail, user);
  }

  async changePassword(oldPassword: string, newPassword: string, user: User): Promise<void> {
    if (!(await user.comparePassword(oldPassword))) {
      throw new IncorrectPassword();
    }

    await user.changePassword(newPassword);
    await this.mailer.sendPasswordChanged(user);
  }

  async confirmEmail(token: string): Promise<void> {
    const confirmation = await this.mailer.findEmailConfirmation({ token });
    if (!confirmation) throw new InvalidEmailConfirmationLink();

    const user = await this.users.findOne({ id: confirmation.uid });
    if (!user) throw new InvalidEmailConfirmationLink();

    if (await this.users.exists({ email: confirmation.newEmail })) {
      await confirmation.deleteOne();
      throw new InvalidEmailConfirmationLink();
    }

    const oldUser = user.toObject();

    await user.changeEmail(confirmation.newEmail);
    await settle([confirmation.deleteOne(), this.mailer.sendEmailChanged(oldUser)]);
  }

  async deleteAccount(password: string, user: User): Promise<void> {
    if (!(await user.comparePassword(password))) throw new IncorrectPassword();

    await settle([
      this.auth.logoutAllDevices(user.id),
      this.files.deleteAllFor(user.id),
      this.mailer.deleteAllFor(user.id)
    ]);

    await user.delete();
  }

  async resendUserActivationEmail(user: User): Promise<void> {
    const activation = await this.mailer.findUserActivation({ uid: user.id });
    if (!activation) throw new UserNotFound(user.username);

    await this.mailer.sendUserActivation(user);
    await activation.resent();
  }
}
