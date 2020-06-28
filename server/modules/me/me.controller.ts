import {
  Body,
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

import { MeService } from "./me.service";

import { ChangeEmailDto } from "./dto/change-email.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { DeleteAccountDto } from "./dto/delete-account.dto";

import { User } from "~/server/decorators/user.decorator";

import { IRedirect } from "~/server/interfaces/redirect.interface";
import { ISession } from "~/server/interfaces/session.interface";

import { AuthGuard } from "~/server/modules/auth/guards/auth.guard";

import { User as IUser } from "~server/modules/users/interfaces/user.interface";

@Controller("me")
@Throttle(30, 60)
@UseGuards(ThrottlerGuard)
export class MeController {
  constructor(private readonly me: MeService) {}

  @Get("activate/:token")
  @Redirect("/login")
  @Throttle(10, 10 * 60)
  async activate(
    @Param("token") token: string,
    @Session() session: ISession
  ): Promise<IRedirect | void> {
    if (session.user) return;

    const user = await this.me.activate(token);
    if (!user) return { url: "/" };
  }

  @Post("change-email")
  @UseGuards(AuthGuard)
  async changeEmail(@Body() { newEmail }: ChangeEmailDto, @User() user: IUser): Promise<void> {
    await this.me.changeEmail(newEmail, user);
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

    await this.me.changePassword(newPassword, user);
  }

  @Patch("confirm-email/:token")
  @Redirect("/settings")
  async confirmEmail(@Param("token") token: string): Promise<void> {
    await this.me.confirmEmail(token);
  }

  @Delete("delete-account")
  @UseGuards(AuthGuard)
  async deleteAccount(@Body() { password }: DeleteAccountDto, @User() user: IUser): Promise<void> {
    if (!(await user.comparePassword(password))) {
      throw new UnauthorizedException("Your password is incorrect!");
    }

    await this.me.deleteUser(user);
  }

  @Post("resend-user-activation")
  @Throttle(10, 10 * 60)
  @UseGuards(AuthGuard)
  async resendUserActivation(@User() user: IUser): Promise<void> {
    await this.me.resendUserActivationEmail(user);
  }
}
