import {
  Body,
  ConflictException,
  Controller,
  Get,
  Param,
  Post,
  Redirect,
  Session,
  UnauthorizedException,
  UseGuards,
  BadRequestException
} from "@nestjs/common";

import { Throttle, ThrottlerGuard } from "nestjs-throttler";

import { UsersService } from "../users/users.service";

import { AuthService } from "./auth.service";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

import { RecaptchaAction } from "~/server/decorators/recaptcha-action.decorator";
import { RecaptchaScore } from "~/server/decorators/recaptcha-score.decorator";
import { RecaptchaGuard } from "~/server/guards/recaptcha.guard";

import { IRedirect } from "~/server/interfaces/redirect.interface";
import { ISession } from "~/server/interfaces/session.interface";

import { AuthGuard } from "~/server/modules/auth/guards/auth.guard";

import { User as IUser } from "~server/modules/users/interfaces/user.interface";
import { User } from "~/server/decorators/user.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly users: UsersService) {}

  @Get("activate/:token")
  @Redirect("/login")
  @Throttle(10, 10 * 60)
  async activate(
    @Param("token") token: string,
    @Session() session: ISession
  ): Promise<IRedirect | void> {
    if (session.user) return;

    const user = await this.auth.activate(token);
    if (!user) return { url: "/" };
  }

  @Post("forgot-password")
  @Throttle(10, 10 * 60)
  async forgotPassword(@Body() { email }: ForgotPasswordDto): Promise<void> {
    if (!(await this.auth.forgotPassword(email))) {
      throw new BadRequestException(
        `Account does not exist for ${email}. Maybe you used a different email address to sign up?`
      );
    }
  }

  @Post("login")
  @RecaptchaAction("login")
  @RecaptchaScore(0.8)
  @Throttle(10, 10 * 60)
  @UseGuards(RecaptchaGuard)
  @UseGuards(ThrottlerGuard)
  async login(
    @Body() { password, username }: LoginDto,
    @Session() session: ISession
  ): Promise<IUser> {
    const user = await this.auth.login(username, password);
    if (!user) throw new UnauthorizedException("Invalid login credentials!");

    session.uid = user.uid;

    return user;
  }

  @Post("logout")
  @Throttle(10, 1 * 60)
  @UseGuards(ThrottlerGuard)
  logout(@Session() session: ISession): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!session.uid) return resolve();

      session.destroy((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  @Post("register")
  @RecaptchaAction("register")
  @RecaptchaScore(0.8)
  @Throttle(5, 10 * 60)
  @UseGuards(RecaptchaGuard)
  @UseGuards(ThrottlerGuard)
  async register(
    @Body() { email, username, password }: RegisterDto,
    @Session() session: ISession
  ): Promise<IUser> {
    if (await this.users.exists({ email })) {
      throw new ConflictException("This email already exists!");
    }

    if (await this.users.exists({ username })) {
      throw new ConflictException("This username already exists!");
    }

    const user = await this.auth.register(email, password, username);

    session.uid = user.uid;

    return user;
  }

  @Post("resend-user-activation")
  @Throttle(10, 10 * 60)
  @UseGuards(AuthGuard)
  async resendUserActivation(@User() user: IUser): Promise<void> {
    await this.auth.resendUserActivationEmail(user);
  }

  @Post("reset-password/:token")
  @Redirect("/login")
  @Throttle(10, 10 * 60)
  @UseGuards(ThrottlerGuard)
  async resetPassword(
    @Body() { newPassword }: ResetPasswordDto,
    @Param("token") token: string
  ): Promise<IRedirect | void> {
    if (!(await this.auth.resetPassword(token, newPassword))) {
      return { url: "/" };
    }
  }
}
