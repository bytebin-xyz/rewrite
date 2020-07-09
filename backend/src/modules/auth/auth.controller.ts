import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Headers,
  Post,
  Session,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";

import { Throttle, ThrottlerGuard } from "nestjs-throttler";

import { UAParser } from "ua-parser-js";

import { AuthService } from "./auth.service";

import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

import { AuthGuard } from "./guards/auth.guard";

import { RecaptchaAction } from "@/decorators/recaptcha-action.decorator";
import { RecaptchaScore } from "@/decorators/recaptcha-score.decorator";

import { RecaptchaGuard } from "@/guards/recaptcha.guard";

import { ISession } from "@/interfaces/session.interface";

import { UsersService } from "@/modules/users/users.service";
import { User } from "@/modules/users/schemas/user.schema";

import { generateId } from "@/utils/generateId";

@Controller("auth")
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly users: UsersService) {}

  @Post("forgot-password")
  @Throttle(10, 10 * 60)
  async forgotPassword(@Body() { email }: ForgotPasswordDto): Promise<void> {
    if (!(await this.auth.forgotPassword(email))) {
      throw new BadRequestException(
        `Account does not exist for ${email}. Maybe you signed up with a different email address?`
      );
    }
  }

  @Post("login")
  @RecaptchaAction("login")
  @RecaptchaScore(0.8)
  @Throttle(10, 10 * 60)
  @UseGuards(RecaptchaGuard)
  async login(
    @Body() { password, username }: LoginDto,
    @Headers("user-agent") userAgent: string | undefined,
    @Session() session: ISession
  ): Promise<User> {
    const user = await this.auth.login(username, password);

    if (!user) throw new UnauthorizedException("Invalid login credentials!");
    if (!user.activated) throw new ForbiddenException("Please activate your account first!");

    const ua = new UAParser(userAgent);

    session.identifier = await generateId(8);
    session.lastUsed = new Date();
    session.ua = {
      browser: ua.getBrowser(),
      device: ua.getDevice(),
      os: ua.getOS()
    };
    session.uid = user.uid;

    return user;
  }

  @Delete("logout")
  @Throttle(10, 1 * 60)
  @UseGuards(AuthGuard)
  logout(@Session() session: ISession): Promise<void> {
    return new Promise((resolve, reject) =>
      session.destroy(error => (error ? reject(error) : resolve()))
    );
  }

  @Post("register")
  @RecaptchaAction("register")
  @RecaptchaScore(0.8)
  @Throttle(5, 10 * 60)
  @UseGuards(RecaptchaGuard)
  async register(@Body() { email, password, username }: RegisterDto): Promise<void> {
    if (await this.users.exists({ email })) throw new ConflictException("Email already taken!");
    if (await this.users.exists({ username }))
      throw new ConflictException("Username already taken!");

    await this.auth.register(email, password, username);
  }

  @Post("reset-password")
  @Throttle(10, 10 * 60)
  async resetPassword(@Body() { newPassword, token }: ResetPasswordDto): Promise<void> {
    if (!(await this.auth.resetPassword(newPassword, token))) {
      throw new BadRequestException(
        "Invalid password reset link, please ensure that the link is correct."
      );
    }
  }
}
