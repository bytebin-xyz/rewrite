import path from "path";
import sharp from "sharp";

import {
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Session,
  UnauthorizedException,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";

import { FileInterceptor } from "@nestjs/platform-express";

import { Throttle } from "nestjs-throttler";

import { AVATAR_PATH } from "./settings.constants";
import { SettingsService } from "./settings.service";

import { ChangeDisplayNameDto } from "./dto/change-display-name.dto";
import { ChangeEmailDto } from "./dto/change-email.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { DeleteAccountDto } from "./dto/delete-account.dto";

import { CurrentUser } from "@/decorators/current-user.decorator";

import { IsOkResponse } from "@/interfaces/is-ok.interface";
import { ISession } from "@/interfaces/session.interface";

import { AuthGuard } from "@/guards/auth.guard";

import { User } from "@/modules/users/schemas/user.schema";

import { AuthService } from "@/modules/auth/auth.service";
import { UsersService } from "@/modules/users/users.service";

import { DiskFile, DiskStorage } from "@/storage/disk.storage";

import { generateId } from "@/utils/generateId";

@Controller("settings")
@Throttle(30, 60)
export class SettingsController {
  constructor(
    private readonly auth: AuthService,
    private readonly settings: SettingsService,
    private readonly users: UsersService
  ) {}

  @Get("activate-account/:token")
  async activate(@Param("token") token: string): Promise<IsOkResponse> {
    return { ok: await this.settings.activate(token) };
  }

  @Patch("change-avatar")
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor("avatar", {
      fileFilter: (_req, file, callback) => {
        const fileTypes = /jpeg|jpg|png/gi;
        const extname = fileTypes.test(path.extname(file.originalname));
        const mimetype = fileTypes.test(file.mimetype);

        if (mimetype && extname) callback(null, true);
        else callback(new UnsupportedMediaTypeException("Invalid file type!"), false);
      },
      limits: {
        files: 1,
        fileSize: 8 * 1024 * 1024
      },
      storage: new DiskStorage({
        directory: AVATAR_PATH,
        filename: (): Promise<string> => generateId(8),
        transformers: [
          (): sharp.Sharp =>
            sharp()
              .resize(512, 512)
              .png()
        ]
      })
    })
  )
  async changeAvatar(@CurrentUser() user: User, @UploadedFile() avatar: DiskFile): Promise<User> {
    return this.settings.changeAvatar(avatar.filename, user);
  }

  @Patch("change-display-name")
  @UseGuards(AuthGuard)
  async changeDisplayName(
    @Body() { newDisplayName }: ChangeDisplayNameDto,
    @CurrentUser() user: User
  ): Promise<User> {
    return user.changeDisplayName(newDisplayName);
  }

  @Post("change-email")
  @UseGuards(AuthGuard)
  async changeEmail(
    @Body() { newEmail }: ChangeEmailDto,
    @CurrentUser() user: User
  ): Promise<void> {
    if (await this.users.exists({ email: newEmail })) {
      throw new ConflictException("Email already taken!");
    }

    await this.settings.changeEmail(newEmail, user);
  }

  @Post("change-password")
  @UseGuards(AuthGuard)
  async changePassword(
    @Body() { newPassword, oldPassword }: ChangePasswordDto,
    @CurrentUser() user: User
  ): Promise<void> {
    if (!user || !(await user.comparePassword(oldPassword))) {
      throw new UnauthorizedException("Your old password is incorrect.");
    }

    await this.settings.changePassword(newPassword, user);
  }

  @Get("confirm-email/:token")
  async confirmEmail(@Param("token") token: string): Promise<IsOkResponse> {
    return { ok: await this.settings.confirmEmail(token) };
  }

  @Post("delete-account")
  @UseGuards(AuthGuard)
  async deleteAccount(
    @Body() { password }: DeleteAccountDto,
    @CurrentUser() user: User
  ): Promise<void> {
    if (!(await user.comparePassword(password))) {
      throw new UnauthorizedException("Your password is incorrect!");
    }

    await this.settings.deleteAccount(user);
  }

  @Post("resend-user-activation")
  @UseGuards(AuthGuard)
  async resendUserActivation(@CurrentUser() user: User): Promise<void> {
    await this.settings.resendUserActivationEmail(user);
  }

  @Delete("revoke-session/:identifier")
  @UseGuards(AuthGuard)
  async revokeSession(
    @CurrentUser() user: User,
    @Param("identifier") identifier: string
  ): Promise<void> {
    await this.auth.logout(identifier, user.id);
  }

  @Delete("revoke-all-sessions")
  @UseGuards(AuthGuard)
  async revokeAllSessions(@CurrentUser() user: User, @Session() session: ISession): Promise<void> {
    await this.auth.logoutAllDevices(user.id, session.identifier);
  }

  @Get("sessions")
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async sessions(
    @CurrentUser() user: User,
    @Session() currentSession: ISession
  ): Promise<(ISession & { isCurrent: boolean })[]> {
    const sessions = await this.auth.getSessions(user.id);

    return sessions.map(session => ({
      isCurrent: session.identifier === currentSession.identifier,
      ...session
    }));
  }
}
