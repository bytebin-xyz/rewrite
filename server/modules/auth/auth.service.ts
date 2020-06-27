import { Collection } from "mongodb";
import { Connection, Model } from "mongoose";

import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";

import { PasswordReset } from "./interfaces/password-reset.interface";
import { UserActivation } from "./interfaces/user-activation.interface";

import { NodemailerService } from "~server/modules/nodemailer/nodemailer.service";
import { UsersService } from "~server/modules/users/users.service";

import { User } from "~/server/modules/users/interfaces/user.interface";

import { generateId } from "~/common/utils/generateId";

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  private sessions!: Collection;

  constructor(
    @InjectConnection()
    private readonly connection: Connection,

    @InjectModel("PasswordReset")
    private readonly passwordResets: Model<PasswordReset>,

    @InjectModel("UserActivation")
    private readonly userActivations: Model<UserActivation>,

    private readonly nodemailer: NodemailerService,
    private readonly users: UsersService
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.sessions = await this.connection.db.collection("sessions");
  }

  async activate(token: string): Promise<User | void> {
    const activation = await this.userActivations.findOne({ token });
    if (!activation) return;

    const user = await this.users.findOne({ uid: activation.uid });
    if (!user) return;

    await user.activate();
    await activation.deleteOne();

    return user;
  }

  async forgotPassword(email: string): Promise<boolean> {
    const user = await this.users.findOne({ email });
    if (!user) return false;

    const token = await generateId(32);

    await this.passwordResets.create({ token, uid: user.uid });
    await this.nodemailer.sendPasswordResetEmail(token, user);

    return true;
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
    const passwordReset = await this.passwordResets.findOne({ token });
    if (!passwordReset) return false;

    const user = await this.users.findOne({ uid: passwordReset.uid });
    if (!user) return false;

    await Promise.allSettled([
      this.sessions.deleteMany({ "session.uid": passwordReset.uid }),
      user.changePassword(newPassword)
    ]);

    await Promise.allSettled([
      this.nodemailer.sendPasswordChangedEmail(user),
      passwordReset.deleteOne()
    ]);

    return true;
  }
}
