import { Injectable } from "@nestjs/common";

import { InvalidCredentials, InvalidPasswordResetLink, UserNotActivated } from "./auth.errors";

import { MailerService } from "@/modules/mailer/mailer.service";
import { SessionsService } from "@/modules/sessions/sessions.service";
import { UsersService } from "@/modules/users/users.service";

import { User } from "@/modules/users/schemas/user.schema";

import { settle } from "@/utils/settle";

@Injectable()
export class AuthService {
  constructor(
    private readonly mailer: MailerService,
    private readonly sessions: SessionsService,
    private readonly users: UsersService
  ) {}

  async forgotPassword(email: string): Promise<boolean> {
    const user = await this.users.findOne({ email });
    if (!user) return false;

    await this.mailer.sendPasswordReset(user);

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

    await this.mailer.sendUserActivation(user);
  }

  async resetPassword(newPassword: string, token: string): Promise<void> {
    const passwordReset = await this.mailer.findPasswordReset({ token });
    if (!passwordReset) throw new InvalidPasswordResetLink();

    const user = await this.users.findOne({ id: passwordReset.id });
    if (!user) throw new InvalidPasswordResetLink();

    await settle([
      this.sessions.delete({ "session.uid": user.id }),
      user.updateOne({ password: newPassword })
    ]);

    await settle([this.mailer.sendPasswordChanged(user), passwordReset.deleteOne()]);
  }
}
