import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Redirect,
  UseGuards,
  UnauthorizedException
} from "@nestjs/common";

import { Throttle, ThrottlerGuard } from "nestjs-throttler";

import { SettingsService } from "./settings.service";

import { ChangeEmailDto } from "./dto/change-email.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";

import { User } from "~/server/decorators/user.decorator";

import { AuthGuard } from "~/server/modules/auth/guards/auth.guard";

import { User as IUser } from "~server/modules/users/interfaces/user.interface";

@Controller("settings")
@Throttle(30, 60)
@UseGuards(ThrottlerGuard)
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Post("change-email")
  @UseGuards(AuthGuard)
  async changeEmail(@Body() { newEmail }: ChangeEmailDto, @User() user: IUser): Promise<void> {
    await this.settings.changeEmail(user, newEmail);
  }

  @Post("change-password")
  @UseGuards(AuthGuard)
  async changePassword(
    @Body() { newPassword, oldPassword }: ChangePasswordDto,
    @User() user: IUser
  ): Promise<void> {
    if (!user || !(await user.comparePassword(oldPassword))) {
      throw new UnauthorizedException("Your old password is incorrect.");
    }

    await this.settings.changePassword(user, newPassword);
  }

  @Patch("confirm-email/:token")
  @Redirect("/settings")
  async confirmEmail(@Param("token") token: string): Promise<void> {
    await this.settings.confirmEmail(token);
  }
}
