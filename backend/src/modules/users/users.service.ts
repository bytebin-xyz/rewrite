import { FilterQuery, Model } from "mongoose";

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { DisplayNameTaken, EmailTaken, UsernameTaken } from "./users.errors";

import { User } from "./schemas/user.schema";

import { IncorrectPassword } from "@/modules/auth/auth.errors";

import { ApplicationsService } from "@/modules/applications/applications.service";
import { FilesService } from "@/modules/files/files.service";
import { MailerService } from "@/modules/mailer/mailer.service";
import { SessionsService } from "@/modules/sessions/sessions.service";

import { settle } from "@/utils/settle";

@Injectable()
export class UsersService {
  constructor(
    private readonly applications: ApplicationsService,
    private readonly files: FilesService,
    private readonly mailer: MailerService,
    private readonly sessions: SessionsService,

    @InjectModel(User.name)
    private readonly users: Model<User>
  ) {}

  async create(email: string, password: string, username: string): Promise<User> {
    if (await this.users.exists({ email })) throw new EmailTaken();
    if (await this.users.exists({ username })) throw new UsernameTaken();

    return new this.users({ displayName: username, email, password, username }).save();
  }

  async deleteOne(user: User, password: string): Promise<User> {
    if (!(await user.comparePassword(password))) throw new IncorrectPassword();

    await settle([
      this.applications.delete({ uid: user.id }),
      this.files.delete({ uid: user.id }),
      this.mailer.delete({ uid: user.id }),
      this.sessions.delete({ "session.uid": user.id })
    ]);

    return user.delete();
  }

  async exists(query: FilterQuery<User>): Promise<boolean> {
    return this.users.exists(query);
  }

  async findOne(query: FilterQuery<User>): Promise<User | null> {
    return this.users.findOne({ ...query, deleted: false });
  }

  async updateOne(
    user: User,
    data: {
      displayName: string;
      email: string;
      newPassword?: string;
      password: string;
    }
  ): Promise<User> {
    const { displayName, email, newPassword, password } = data;

    if (!(await user.comparePassword(password))) throw new IncorrectPassword();

    if (displayName !== user.displayName) {
      if (await this.users.exists({ displayName })) throw new DisplayNameTaken();

      user.displayName = displayName;
    }

    if (email !== user.email) {
      if (await this.users.exists({ email })) throw new EmailTaken();

      await this.mailer.sendEmailConfirmation(email, user);
    }

    if (newPassword) {
      user.password = newPassword;
    }

    return user.save();
  }

  async updateAvatar(user: User, newAvatarId: string): Promise<User> {
    if (user.avatar) {
      await this.files.delete({ id: user.avatar, uid: user.id }).catch(() => undefined);
    }

    user.avatar = newAvatarId;

    return user.save();
  }
}
