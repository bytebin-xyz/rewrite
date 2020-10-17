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

import { FileTypes } from "@/modules/files/enums/file-types.enum";

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

  async create(
    email: string,
    password: string,
    username: string
  ): Promise<User> {
    if (await this.users.exists({ email })) throw new EmailTaken();
    if (await this.users.exists({ username })) throw new UsernameTaken();

    const user = await new this.users({
      displayName: username,
      email,
      password,
      username
    }).save();

    await this.files.create(
      {
        capabilities: {
          canAddChildren: true,
          canCopy: false,
          canDelete: false,
          canDownload: false,
          canMove: false,
          canRemoveChildren: true,
          canRename: false,
          canShare: false
        },
        name: "(root)",
        parent: null,
        type: FileTypes.Directory,
        uid: user.id,
        writtenTo: null
      },
      {
        isRoot: true
      }
    );

    return user;
  }

  async deleteOne(user: User, password: string): Promise<User> {
    if (!(await user.comparePassword(password))) {
      throw new IncorrectPassword();
    }

    await settle([
      this.applications.deleteMany({ uid: user.id }),
      this.files.deleteMany({ uid: user.id }),
      this.sessions.deleteMany({ "session.uid": user.id })
    ]);

    return user.delete();
  }

  async exists(query: FilterQuery<User>): Promise<boolean> {
    return this.users.exists(query);
  }

  async find(query: FilterQuery<User>): Promise<User[]> {
    return this.users.find({ ...query, deleted: false });
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

    if (!(await user.comparePassword(password))) {
      throw new IncorrectPassword();
    }

    if (displayName !== user.displayName) {
      if (await this.users.exists({ displayName })) {
        throw new DisplayNameTaken();
      }

      user.displayName = displayName;
    }

    if (email !== user.email) {
      if (await this.users.exists({ email })) {
        throw new EmailTaken();
      }

      const confirmation = await new this.emailConfirmations({
        email,
        uid: user.id
      }).save();

      await this.mailer.send(
        emailConfirmation(email, {
          displayName: user.displayName,
          link: this.mailer.createAbsoluteLink(
            `/confirm-email/${confirmation.token}`
          )
        })
      );

      user.email = email;
    }

    if (newPassword) {
      await this.mailer.send(
        passwordChangedEmail(user.email, {
          displayName: user.displayName,
          link: this.mailer.createAbsoluteLink("/forgot-password")
        })
      );

      user.password = newPassword;
    }

    await user.save();

    return user;
  }

  async updateAvatar(user: User, newAvatarId: string): Promise<User> {
    if (user.avatar) {
      await this.files
        .deleteOne({ id: user.avatar, uid: user.id })
        .catch(() => undefined); // prettier-ignore
    }

    user.avatar = newAvatarId;

    return user.save();
  }
}
