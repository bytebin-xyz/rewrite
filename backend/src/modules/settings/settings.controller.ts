import path from "path";
import sharp from "sharp";

import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";

import { Request } from "express";

import { Throttle } from "nestjs-throttler";

import { InvalidAvatarFileType } from "./settings.errors";
import { SettingsService } from "./settings.service";

import { ChangeDisplayNameDto } from "./dto/change-display-name.dto";
import { ChangeEmailDto } from "./dto/change-email.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { DeleteAccountDto } from "./dto/delete-account.dto";

import { CurrentUser } from "@/decorators/current-user.decorator";

import { AuthGuard } from "@/guards/auth.guard";

import { FilesService } from "@/modules/files/files.service";
import { StorageService } from "@/modules/storage/storage.service";

import { User } from "@/modules/users/schemas/user.schema";

@Controller("settings")
@Throttle(30, 60)
export class SettingsController {
  constructor(
    private readonly files: FilesService,
    private readonly settings: SettingsService,
    private readonly storage: StorageService
  ) {}

  @Get("activate-account/:token")
  activateAccount(@Param("token") token: string): Promise<void> {
    return this.settings.activate(token);
  }

  @Patch("change-avatar")
  @UseGuards(AuthGuard)
  async changeAvatar(@CurrentUser() user: User, @Req() req: Request): Promise<User> {
    const [avatar] = await this.storage.write(req, {
      field: "avatar",
      filter: (_req, file, callback) => {
        const fileTypes = /jpeg|jpg|png/gi;
        const extname = fileTypes.test(path.extname(file.filename));
        const mimetype = fileTypes.test(file.mimetype);

        if (mimetype && extname) callback(null, true);
        else callback(new InvalidAvatarFileType(), false);
      },
      limits: {
        files: 1,
        fileSize: 8 * 1024 * 1024
      },
      transformers: [
        () =>
          sharp()
            .resize(512, 512)
            .png()
      ]
    });

    await this.files.create({
      filename: avatar.filename,
      hidden: true,
      id: avatar.id,
      public: true,
      size: avatar.size,
      uid: user.id
    });

    return this.settings.changeAvatar(avatar.id, user);
  }

  @Patch("change-display-name")
  @UseGuards(AuthGuard)
  changeDisplayName(
    @Body() { newDisplayName }: ChangeDisplayNameDto,
    @CurrentUser() user: User
  ): Promise<User> {
    return this.settings.changeDisplayName(newDisplayName, user);
  }

  @Post("change-email")
  @UseGuards(AuthGuard)
  changeEmail(@Body() { newEmail }: ChangeEmailDto, @CurrentUser() user: User): Promise<void> {
    return this.settings.changeEmail(newEmail, user);
  }

  @Post("change-password")
  @UseGuards(AuthGuard)
  changePassword(
    @Body() { newPassword, oldPassword }: ChangePasswordDto,
    @CurrentUser() user: User
  ): Promise<void> {
    return this.settings.changePassword(oldPassword, newPassword, user);
  }

  @Get("confirm-email/:token")
  confirmEmail(@Param("token") token: string): Promise<void> {
    return this.settings.confirmEmail(token);
  }

  @Post("delete-account")
  @UseGuards(AuthGuard)
  deleteAccount(@Body() { password }: DeleteAccountDto, @CurrentUser() user: User): Promise<void> {
    return this.settings.deleteAccount(password, user);
  }

  @Post("resend-user-activation")
  @UseGuards(AuthGuard)
  resendUserActivation(@CurrentUser() user: User): Promise<void> {
    return this.settings.resendUserActivationEmail(user);
  }
}
