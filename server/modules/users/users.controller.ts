import { Controller, Get, Param, UseGuards, BadRequestException } from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "nestjs-throttler";

import { UsersService } from "./users.service";

import { PartialUser, User as IUser } from "./interfaces/user.interface";

import { User } from "~/server/decorators/user.decorator";

import { AuthGuard } from "~/server/modules/auth/guards/auth.guard";

@Controller("users")
@Throttle(30, 60)
@UseGuards(ThrottlerGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("@me")
  @UseGuards(AuthGuard)
  me(@User() me: IUser): IUser {
    return me;
  }

  @Get("search/@:username")
  @UseGuards(AuthGuard)
  async search(@Param("username") username: string): Promise<PartialUser> {
    const user = await this.users.search({ username });
    if (!user) throw new BadRequestException("User does not exists!");

    return user;
  }
}
