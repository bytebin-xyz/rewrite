import { Collection } from "mongodb";
import { Connection } from "mongoose";

import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";

import { NodemailerService } from "~server/modules/nodemailer/nodemailer.service";
import { UsersService } from "~server/modules/users/users.service";

import { User } from "~/server/modules/users/interfaces/user.interface";

import { settle } from "~common/utils/settle";

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  private sessions!: Collection;

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly nodemailer: NodemailerService,
    private readonly users: UsersService
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.sessions = await this.connection.db.collection("sessions");
  }

  async forgotPassword(email: string): Promise<boolean> {
    const user = await this.users.findOne({ email });
    if (!user) return false;

    await this.nodemailer.sendPasswordResetEmail(user);

    return true;
  }

  async register(email: string, password: string, username: string): Promise<User> {
    const user = await this.users.create(email, password, username);

    await this.nodemailer.sendUserActivationEmail(user);

    return user;
  }

  async resetPassword(newPassword: string, token: string): Promise<boolean> {
    const passwordReset = await this.nodemailer.findPasswordReset(token);
    if (!passwordReset) return false;

    const user = await this.users.findOne({ uid: passwordReset.uid });
    if (!user) return false;

    await settle([
      this.sessions.deleteMany({ "session.uid": passwordReset.uid }),
      user.changePassword(newPassword)
    ]);

    await settle([this.nodemailer.sendPasswordChangedEmail(user), passwordReset.deleteOne()]);

    return true;
  }
}
