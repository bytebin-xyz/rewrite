import { Connection } from "mongoose";

import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";

import { ISession } from "@/interfaces/session.interface";
import { ISessions } from "@/interfaces/sessions.interface";

import { NodemailerService } from "@/modules/nodemailer/nodemailer.service";
import { UsersService } from "@/modules/users/users.service";

import { User } from "@/modules/users/schemas/user.schema";

import { settle } from "@/utils/settle";

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

  async getSessions(currentSession: string, uid: string): Promise<ISessions[]> {
    const sessions = await this.sessions
      .find(
        { "session.uid": uid },
        {
          projection: {
            _id: 0,
            expires: 0,
            "session.cookie": 0
          }
        }
      )
      .toArray();

    return (
      sessions
        .map<ISessions>(({ session }: { session: ISession }) => ({
          current: currentSession === session.identifier,
          ...session
        }))
        // Sort the array so that the current session should always be the first element
        .sort((a, b) => Number(b.current) - Number(a.current))
    );
  }

  async login(username: string, password: string): Promise<User | void> {
    const user = await this.users.findOne({ $or: [{ email: username }, { username }] });
    if (user && (await user.comparePassword(password))) return user;
  }

  async logout(identifier: string, user: User): Promise<void> {
    await this.sessions.deleteOne({
      "session.identifier": identifier,
      "session.uid": user.uid
    });
  }

  async logoutAllDevices(user: User, currentSession?: string): Promise<void> {
    await this.sessions.deleteMany({
      "session.identifier": { $ne: currentSession },
      "session.uid": user.uid
    });
  }

  async register(email: string, password: string, username: string): Promise<User> {
    const user = await this.users.create(email, password, username);

    await this.nodemailer.sendUserActivation(user);

    return user;
  }

  async resetPassword(newPassword: string, token: string): Promise<boolean> {
    const passwordReset = await this.nodemailer.findPasswordReset({ token });
    if (!passwordReset) return false;

    const user = await this.users.findOne({ uid: passwordReset.uid });
    if (!user) return false;

    await settle([this.logoutAllDevices(user), user.changePassword(newPassword)]);
    await settle([this.nodemailer.sendPasswordChanged(user), passwordReset.deleteOne()]);

    return true;
  }
}