import { Injectable } from "@nestjs/common";

import { InvalidEmailConfirmationLink, InvalidUserActivationLink } from "./settings.errors";

import { MailerService } from "@/modules/mailer/mailer.service";
import { UsersService } from "@/modules/users/users.service";

import { settle } from "@/utils/settle";

@Injectable()
export class SettingsService {
  constructor(private readonly mailer: MailerService, private readonly users: UsersService) {}

  async activate(token: string): Promise<void> {
    const activation = await this.mailer.findUserActivation({ token });
    if (!activation) throw new InvalidUserActivationLink();

    const user = await this.users.findOne({ id: activation.uid });
    if (!user) throw new InvalidUserActivationLink();

    await user.activate();
    await activation.deleteOne();
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

    const oldUser = user.toJSON();

    user.email = confirmation.newEmail;

    await user.save();

    await settle([confirmation.deleteOne(), this.mailer.sendEmailChanged(oldUser)]);
  }
}
