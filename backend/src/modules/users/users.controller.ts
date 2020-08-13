import path from "path";
import sharp from "sharp";

import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";

import { Request } from "express";

import { InvalidAvatarFileType, UserNotFound } from "./users.errors";
import { UsersService } from "./users.service";

import { DeleteUserDto } from "./dto/delete-user.dto";
import { PartialUserDto } from "./dto/partial-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserDto } from "./dto/user.dto";

import { User } from "./schemas/user.schema";

import { CurrentUser } from "@/decorators/current-user.decorator";
import { UseScopes } from "@/decorators/scopes.decorator";

import { AuthGuard } from "@/guards/auth.guard";

import { ApplicationScopes } from "@/modules/applications/enums/application-scopes.enum";

import { FilesService } from "@/modules/files/files.service";
import { StorageService } from "@/modules/storage/storage.service";

@Controller("users")
@UseGuards(AuthGuard)
export class UsersController {
  constructor(
    private readonly files: FilesService,
    private readonly storage: StorageService,
    private readonly users: UsersService
  ) {}

  @Get("@me")
  @UseScopes(ApplicationScopes.USERS_READ)
  me(@CurrentUser() me: User): UserDto {
    return me.toDto();
  }

  @Patch("@me")
  updateOne(@Body() dto: UpdateUserDto, @CurrentUser() me: User): Promise<UserDto> {
    return this.users.updateOne(me, dto).then(user => user.toDto());
  }

  @Post("@me/avatar")
  async updateAvatar(@CurrentUser() me: User, @Req() req: Request): Promise<UserDto> {
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
      uid: me.id
    });

    return this.users.updateAvatar(me, avatar.id).then(user => user.toDto());
  }

  @Post("@me/delete")
  deleteOne(@Body() { password }: DeleteUserDto, @CurrentUser() me: User): Promise<UserDto> {
    return this.users.deleteOne(me, password);
  }

  @Get("confirm-email/:token")
  confirmEmail(@Param("token") token: string): Promise<void> {
    return this.users.confirmEmail(token);
  }

  @Get("search/@:username")
  async search(@Param("username") username: string): Promise<UserDto> {
    const user = await this.users.findOne({ username });
    if (!user) throw new UserNotFound(username);

    return user.toDto(PartialUserDto);
  }
}