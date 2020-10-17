import { ApiExcludeEndpoint } from "@nestjs/swagger";

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards
} from "@nestjs/common";

import { Throttle } from "nestjs-throttler";

import { AuthService } from "./auth.service";

import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

import { RecaptchaAction } from "@/decorators/recaptcha-action.decorator";
import { RecaptchaScore } from "@/decorators/recaptcha-score.decorator";

import { Request } from "@/interfaces/request.interface";

import { RecaptchaGuard } from "@/guards/recaptcha.guard";

import { UserDto } from "@/modules/users/dto/user.dto";

@Controller("auth")
@Throttle(25, 300) // 25 request every 5 minutes
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @ApiExcludeEndpoint()
  @Get("activate-account/:token")
  activateAccount(@Param("token") token: string): Promise<void> {
    return this.auth.activateAccount(token);
  }

  @ApiExcludeEndpoint()
  @Post("forgot-password")
  forgotPassword(@Body() dto: ForgotPasswordDto): void {
    /*
     * Don't await so that if an account with the email does exists,
     * it will take the same response time as if the account didn't exist
     */
    this.auth.forgotPassword(dto.email);
  }

  @ApiExcludeEndpoint()
  @Post("login")
  @RecaptchaAction("login")
  @RecaptchaScore(0.7)
  @UseGuards(RecaptchaGuard)
  async login(@Body() dto: LoginDto, @Req() req: Request): Promise<UserDto> {
    const user = await this.auth.login(dto.username, dto.password);

    req.session.uid = user.id;

    return user.toDto();
  }

  @ApiExcludeEndpoint()
  @Delete("logout")
  logout(@Req() req: Request): Promise<void> {
    return new Promise((resolve, reject) =>
      req.session.destroy((error) => (error ? reject(error) : resolve()))
    );
  }

  @ApiExcludeEndpoint()
  @Post("register")
  @RecaptchaAction("register")
  @RecaptchaScore(0.7)
  @UseGuards(RecaptchaGuard)
  register(@Body() dto: RegisterDto): Promise<void> {
    return this.auth.register(dto.email, dto.password, dto.username);
  }

  @ApiExcludeEndpoint()
  @Post("reset-password")
  resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    return this.auth.resetPassword(dto.newPassword, dto.token);
  }
}
