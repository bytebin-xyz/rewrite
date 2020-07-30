import { Connection } from "mongoose";

import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";

import { ISession } from "@/interfaces/session.interface";

import { NodemailerService } from "@/modules/nodemailer/nodemailer.service";
import { UsersService } from "@/modules/users/users.service";

import { User } from "@/modules/users/schemas/user.schema";

import { settle } from "@/utils/settle";
import { InvalidCredentials, UserNotActivated, InvalidPasswordResetLink } from "./auth.errors";

@Injectable()
export class AuthService {
  private sessions = this.connection.db.collection("sessions");

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly nodemailer: NodemailerService,
    private readonly users: UsersService
  ) {}

  async forgotPassword(email: string): Promise<boolean> {
    const user = await this.users.findOne({ email });
    if (!user) return false;

    await this.nodemailer.sendPasswordReset(user);

    return true;
  }

  async getSessions(uid: string): Promise<ISession[]> {
    return this.sessions
      .find<{ session: ISession }>({ "session.uid": uid })
      .project({ _id: 0, expires: 0, "session.cookie": 0 })
      .toArray()
      .then(sessions => sessions.map(({ session }) => session));
  }

  async login(username: string, password: string): Promise<User> {
    const user = await this.users.findOne({ $or: [{ email: username }, { username }] });

    if (!user || !(await user.comparePassword(password))) throw new InvalidCredentials();
    if (!user.activated) throw new UserNotActivated();

    return user;
  }

  async logout(identifier: string, uid: string): Promise<void> {
    await this.sessions.deleteOne({
      "session.identifier": identifier,
      "session.uid": uid
    });
  }

  async logoutAllDevices(uid: string, currentSession?: string): Promise<void> {
    await this.sessions.deleteMany({
      "session.identifier": { $ne: currentSession },
      "session.uid": uid
    });
  }

  async register(email: string, password: string, username: string): Promise<User> {
    const user = await this.users.create(email, password, username);

    await this.nodemailer.sendUserActivation(user);

    return user;
  }

  async resetPassword(newPassword: string, token: string): Promise<boolean> {
    const passwordReset = await this.nodemailer.findPasswordReset({ token });
    if (!passwordReset) throw new InvalidPasswordResetLink();

    const user = await this.users.findOne({ id: passwordReset.id });
    if (!user) throw new InvalidPasswordResetLink();

    await settle([this.logoutAllDevices(user.id), user.changePassword(newPassword)]);
    await settle([this.nodemailer.sendPasswordChanged(user), passwordReset.deleteOne()]);

    return true;
  }
}
