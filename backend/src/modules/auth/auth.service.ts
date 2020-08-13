import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { Model } from "mongoose";

import {
  InvalidCredentials,
  InvalidPasswordResetLink,
  InvalidUserActivationLink,
  UserNotActivated
} from "./auth.errors";

import { passwordChanged } from "./emails/password-changed.email";
import { passwordReset } from "./emails/password-reset.email";
import { userActivation } from "./emails/user-activation.email";

import { PasswordReset } from "./schemas/password-reset.schema";
import { UserActivation } from "./schemas/user-activation.schema";

import { MailerService } from "@/modules/mailer/mailer.service";
import { SessionsService } from "@/modules/sessions/sessions.service";
import { UsersService } from "@/modules/users/users.service";

import { User } from "@/modules/users/schemas/user.schema";

@Injectable()
export class AuthService {
  constructor(
    private readonly mailer: MailerService,
    private readonly sessions: SessionsService,
    private readonly users: UsersService,

    @InjectModel(PasswordReset.name)
    private readonly passwordResets: Model<PasswordReset>,

    @InjectModel(UserActivation.name)
    private readonly userActivations: Model<UserActivation>
  ) {}

  async activateAccount(token: string): Promise<void> {
    const activation = await this.userActivations.findOne({ token });
    if (!activation) throw new InvalidUserActivationLink();

    const user = await this.users.findOne({ id: activation.uid });
    if (!user) throw new InvalidUserActivationLink();

    user.activated = true;
    user.expiresAt = null;

    await user.save();
    await activation.deleteOne();
  }

  async forgotPassword(email: string): Promise<boolean> {
    const user = await this.users.findOne({ email });
    if (!user) return false;

    const reset = await new this.passwordResets({ uid: user.id }).save();

    await this.mailer.send(
      passwordReset(email, {
        displayName: user.displayName,
        link: this.mailer.createAbsoluteLink(`/reset-password/${reset.token}`)
      })
    );

    return true;
  }

  async login(username: string, password: string): Promise<User> {
    const user = await this.users.findOne({ $or: [{ email: username }, { username }] });

    if (!user || !(await user.comparePassword(password))) throw new InvalidCredentials();
    if (!user.activated) throw new UserNotActivated();

    return user;
  }

  async register(email: string, password: string, username: string): Promise<void> {
    const user = await this.users.create(email, password, username);
    const activation = await new this.userActivations({ uid: user.id }).save();

    await this.mailer.send(
      userActivation(email, {
        displayName: user.displayName,
        link: this.mailer.createAbsoluteLink(`/activate-account/${activation.token}`)
      })
    );
  }

  async resetPassword(newPassword: string, token: string): Promise<void> {
    const passwordReset = await this.passwordResets.findOne({ token });
    if (!passwordReset) throw new InvalidPasswordResetLink();

    const user = await this.users.findOne({ id: passwordReset.uid });
    if (!user) throw new InvalidPasswordResetLink();

    await this.sessions.delete({ "session.uid": user.id });

    user.password = newPassword;

    await user.save();
    await passwordReset.deleteOne();

    await this.mailer.send(
      passwordChanged(user.email, {
        displayName: user.displayName,
        link: this.mailer.createAbsoluteLink("/forgot-password")
      })
    );
  }
}
