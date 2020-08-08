import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Req,
  Session,
  UseGuards
} from "@nestjs/common";

import { getClientIp } from "request-ip";

import { Request } from "express";

import { Throttle } from "nestjs-throttler";

import { UAParser } from "ua-parser-js";

import { AuthService } from "./auth.service";

import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { SessionDto } from "./dto/session.dto";

import { CurrentUser } from "@/decorators/current-user.decorator";
import { RecaptchaAction } from "@/decorators/recaptcha-action.decorator";
import { RecaptchaScore } from "@/decorators/recaptcha-score.decorator";

import { ISession } from "@/interfaces/session.interface";

import { AuthGuard } from "@/guards/auth.guard";
import { RecaptchaGuard } from "@/guards/recaptcha.guard";

import { UsersService } from "@/modules/users/users.service";
import { User } from "@/modules/users/schemas/user.schema";

import { generateId } from "@/utils/generateId";

@Controller("auth")
@Throttle(25, 300) // 25 request every 5 minutes
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly users: UsersService) {}

  @Post("forgot-password")
  forgotPassword(@Body() { email }: ForgotPasswordDto): void {
    /*
     * Don't await so that if an account with the email does exists,
     * it will take the same response time as if the account didn't exist
     */
    this.auth.forgotPassword(email);
  }

  @Post("login")
  @RecaptchaAction("login")
  @RecaptchaScore(0.8)
  @UseGuards(RecaptchaGuard)
  async login(
    @Body() { password, username }: LoginDto,
    @Headers("user-agent") userAgent: string | undefined,
    @Req() req: Request,
    @Session() session: ISession
  ): Promise<User> {
    const user = await this.auth.login(username, password);
    const ua = new UAParser(userAgent);

    session.identifier = await generateId(8);
    session.lastUsed = new Date();
    session.ip = getClientIp(req);
    session.ua = {
      browser: ua.getBrowser(),
      device: ua.getDevice(),
      os: ua.getOS()
    };
    session.uid = user.id;

    return user;
  }

  @Delete("logout")
  logout(@Session() session: ISession): Promise<void> {
    return new Promise((resolve, reject) =>
      session.destroy(error => (error ? reject(error) : resolve()))
    );
  }

  @Post("register")
  @RecaptchaAction("register")
  @RecaptchaScore(0.8)
  @UseGuards(RecaptchaGuard)
  register(@Body() { email, password, username }: RegisterDto): Promise<void> {
    return this.auth.register(email, password, username);
  }

  @Post("reset-password")
  resetPassword(@Body() { newPassword, token }: ResetPasswordDto): Promise<void> {
    return this.auth.resetPassword(newPassword, token);
  }

  @Delete("revoke-session/:identifier")
  @UseGuards(AuthGuard)
  revokeSession(@CurrentUser() user: User, @Param("identifier") identifier: string): Promise<void> {
    return this.auth.logout(identifier, user.id);
  }

  @Delete("revoke-all-sessions")
  @UseGuards(AuthGuard)
  revokeAllSessions(@CurrentUser() user: User, @Session() session: ISession): Promise<void> {
    return this.auth.logoutAllDevices(user.id, session.identifier);
  }

  @Get("sessions")
  @UseGuards(AuthGuard)
  sessions(@CurrentUser() user: User, @Session() currentSession: ISession): Promise<SessionDto[]> {
    return this.auth.getSessions(user.id).then(sessions =>
      sessions.map(session => ({
        ...session,
        isCurrent: session.identifier === currentSession.identifier
      }))
    );
  }
}