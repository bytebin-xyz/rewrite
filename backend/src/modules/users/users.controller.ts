import { Controller, Get, NotFoundException, Param, UseGuards } from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "nestjs-throttler";

import { UsersService } from "./users.service";

import { PartialUser } from "./schemas/partial-user.schema";
import { User } from "./schemas/user.schema";

import { CurrentUser } from "@/decorators/current-user.decorator";

import { AuthGuard } from "@/modules/auth/guards/auth.guard";

@Controller("users")
@Throttle(30, 60)
@UseGuards(ThrottlerGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("@me")
  @UseGuards(AuthGuard)
  me(@CurrentUser() me: User): User {
    return me;
  }

  @Get("search/@:username")
  @UseGuards(AuthGuard)
  async search(@Param("username") username: string): Promise<PartialUser> {
    const user = await this.users.search({ username });
    if (!user) throw new NotFoundException("User not found!");

    return user;
  }
}
