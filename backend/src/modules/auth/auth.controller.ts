import { ApiExcludeEndpoint } from "@nestjs/swagger";

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

import { successfulLogin } from "./emails/successful-login.email";

import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

import { RecaptchaAction } from "@/decorators/recaptcha-action.decorator";
import { RecaptchaScore } from "@/decorators/recaptcha-score.decorator";

import { RecaptchaGuard } from "@/guards/recaptcha.guard";

import { ISessionData } from "@/modules/sessions/interfaces/session-data.interface";

import { MailerService } from "@/modules/mailer/mailer.service";

import { UserDto } from "@/modules/users/dto/user.dto";

import { generateId } from "@/utils/generateId";

@Controller("auth")
@Throttle(25, 300) // 25 request every 5 minutes
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly mailer: MailerService) {}

  @ApiExcludeEndpoint()
  @Get("activate-account/:token")
  activateAccount(@Param("token") token: string): Promise<void> {
    return this.auth.activateAccount(token);
  }

  @ApiExcludeEndpoint()
  @Post("forgot-password")
  forgotPassword(@Body() { email }: ForgotPasswordDto): void {
    /*
     * Don't await so that if an account with the email does exists,
     * it will take the same response time as if the account didn't exist
     */
    this.auth.forgotPassword(email);
  }

  @ApiExcludeEndpoint()
  @Post("login")
  @RecaptchaAction("login")
  @RecaptchaScore(0.7)
  @UseGuards(RecaptchaGuard)
  async login(
    @Body() { password, username }: LoginDto,
    @Headers("user-agent") userAgent: string | undefined,
    @Req() req: Request,
    @Session() session: ISessionData
  ): Promise<UserDto> {
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

    await this.mailer.send(
      successfulLogin(user.email, {
        displayName: user.displayName,
        link: this.mailer.createAbsoluteLink("/forgot-password"),
        session
      })
    );

    return user.toDto();
  }

  @ApiExcludeEndpoint()
  @Delete("logout")
  logout(@Session() session: Express.Session): Promise<void> {
    return new Promise((resolve, reject) =>
      session.destroy(error => (error ? reject(error) : resolve()))
    );
  }

  @ApiExcludeEndpoint()
  @Post("register")
  @RecaptchaAction("register")
  @RecaptchaScore(0.7)
  @UseGuards(RecaptchaGuard)
  register(@Body() { email, password, username }: RegisterDto): Promise<void> {
    return this.auth.register(email, password, username);
  }

  @ApiExcludeEndpoint()
  @Post("reset-password")
  resetPassword(@Body() { newPassword, token }: ResetPasswordDto): Promise<void> {
    return this.auth.resetPassword(newPassword, token);
  }
}
