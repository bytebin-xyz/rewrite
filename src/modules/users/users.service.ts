import { FilterQuery, Model } from "mongoose";

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import {
  DisplayNameTaken,
  EmailTaken,
  InvalidEmailConfirmationToken,
  UsernameTaken
} from "./users.errors";

import { emailChanged } from "./emails/email-changed.email";
import { emailConfirmation } from "./emails/email-confirmation.email";
import { passwordChangedEmail } from "./emails/password-changed.email";

import { EmailConfirmation } from "./schemas/email-confirmation.schema";
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

    @InjectModel(EmailConfirmation.name)
    private readonly emailConfirmations: Model<EmailConfirmation>,

    @InjectModel(User.name)
    private readonly users: Model<User>
  ) {}

  async confirmEmail(token: string): Promise<void> {
    const confirmation = await this.emailConfirmations.findOne({ token });
    if (!confirmation) throw new InvalidEmailConfirmationToken();

    const user = await this.users.findOne({ id: confirmation.uid });
    if (!user) throw new InvalidEmailConfirmationToken();

    if (await this.users.exists({ email: confirmation.newEmail })) {
      await confirmation.deleteOne();
      throw new InvalidEmailConfirmationToken();
    }

    const oldUser = user.toObject();

    user.email = confirmation.newEmail;

    await user.save();
    await confirmation.deleteOne();

    await this.mailer.send(
      emailChanged(oldUser.email, {
        displayName: user.displayName,
        link: this.mailer.createAbsoluteLink("/forgot-password")
      })
    );
  }

  async create(email: string, password: string, username: string): Promise<User> {
    if (await this.users.exists({ email })) throw new EmailTaken();
    if (await this.users.exists({ username })) throw new UsernameTaken();

    return new this.users({ displayName: username, email, password, username }).save();
  }

  async deleteOne(user: User, password: string): Promise<User> {
    if (!(await user.comparePassword(password))) throw new IncorrectPassword();

    await settle([
      this.applications.delete({ uid: user.id }),
      this.files.deleteMany({ uid: user.id }),
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
      newDisplayName?: string;
      newEmail?: string;
      newPassword?: string;
      password: string;
    }
  ): Promise<User> {
    const { newDisplayName, newEmail, newPassword, password } = data;

    if (!(await user.comparePassword(password))) {
      throw new IncorrectPassword();
    }

    if (newDisplayName && newDisplayName !== user.displayName) {
      if (await this.users.exists({ displayName: newDisplayName })) {
        throw new DisplayNameTaken();
      }

      user.displayName = newDisplayName;
    }

    if (newEmail && newEmail !== user.email) {
      if (await this.users.exists({ email: newEmail })) {
        throw new EmailTaken();
      }

      const confirmation = await new this.emailConfirmations({ newEmail, uid: user.id }).save();

      await this.mailer.send(
        emailConfirmation(newEmail, {
          displayName: user.displayName,
          link: this.mailer.createAbsoluteLink(`/confirm-email/${confirmation.token}`)
        })
      );
    }

    if (newPassword) {
      user.password = newPassword;

      await this.mailer.send(
        passwordChangedEmail(user.email, {
          displayName: user.displayName,
          link: this.mailer.createAbsoluteLink("/forgot-password")
        })
      );
    }

    await user.save();

    return user;
  }

  async updateAvatar(user: User, newAvatarId: string): Promise<User> {
    if (user.avatar) {
      await this.files.deleteOne({ id: user.avatar, uid: user.id }).catch(() => undefined);
    }

    user.avatar = newAvatarId;

    return user.save();
  }
}
