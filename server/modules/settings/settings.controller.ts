import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Redirect,
  Session,
  UseGuards,
  UnauthorizedException
} from "@nestjs/common";

import { Throttle, ThrottlerGuard } from "nestjs-throttler";

import { SettingsService } from "./settings.service";

import { ChangeDisplayNameDto } from "./dto/change-display-name.dto";
import { ChangeEmailDto } from "./dto/change-email.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { DeleteAccountDto } from "./dto/delete-account.dto";

import { User } from "~/server/decorators/user.decorator";

import { IRedirect } from "~/server/interfaces/redirect.interface";
import { ISession } from "~/server/interfaces/session.interface";

import { AuthGuard } from "~/server/modules/auth/guards/auth.guard";

import { User as IUser } from "~server/modules/users/interfaces/user.interface";
import { UsersService } from "~server/modules/users/users.service";

@Controller("settings")
@Throttle(30, 60)
@UseGuards(ThrottlerGuard)
export class SettingsController {
  constructor(private readonly settings: SettingsService, private readonly users: UsersService) {}

  @Get("activate/:token")
  @Redirect("/login")
  async activate(
    @Param("token") token: string,
    @Session() session: ISession
  ): Promise<IRedirect | void> {
    if (session.user) return;

    const user = await this.settings.activate(token);
    if (!user) return { url: "/" };
  }

  @Patch("change-display-name")
  @UseGuards(AuthGuard)
  async changeDisplayName(
    @Body() { newDisplayName }: ChangeDisplayNameDto,
    @User() user: IUser
  ): Promise<void> {
    if (await this.users.exists({ display_name: newDisplayName })) {
      throw new ConflictException("Display name already taken!");
    }

    await user.changeDisplayName(newDisplayName);
  }

  @Post("change-email")
  @UseGuards(AuthGuard)
  async changeEmail(@Body() { newEmail }: ChangeEmailDto, @User() user: IUser): Promise<void> {
    if (await this.users.exists({ email: newEmail })) {
      throw new ConflictException("Email already taken!");
    }

    await this.settings.changeEmail(newEmail, user);
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

    await this.settings.changePassword(newPassword, user);
  }

  @Get("confirm-email/:token")
  @Redirect("/settings")
  async confirmEmail(@Param("token") token: string): Promise<IRedirect | void> {
    if (!(await this.settings.confirmEmail(token))) {
      return { url: "/" };
    }
  }

  @Delete("delete-account")
  @UseGuards(AuthGuard)
  async deleteAccount(@Body() { password }: DeleteAccountDto, @User() user: IUser): Promise<void> {
    if (!(await user.comparePassword(password))) {
      throw new UnauthorizedException("Your password is incorrect!");
    }

    await this.settings.deleteAccount(user);
  }

  @Post("resend-user-activation")
  @UseGuards(AuthGuard)
  async resendUserActivation(@User() user: IUser): Promise<void> {
    await this.settings.resendUserActivationEmail(user);
  }
}
