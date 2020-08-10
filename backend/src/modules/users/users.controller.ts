import { Controller, Get, Param, UseGuards } from "@nestjs/common";

import { UserNotFound } from "./users.errors";
import { UsersService } from "./users.service";

import { PartialUserDto } from "./dto/partial-user.dto";
import { UserDto } from "./dto/user.dto";

import { User } from "./schemas/user.schema";

import { CurrentUser } from "@/decorators/current-user.decorator";

import { AuthGuard } from "@/guards/auth.guard";

@Controller("users")
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("@me")
  me(@CurrentUser() me: User): UserDto {
    return me.toDto();
  }

  @Get("search/@:username")
  async search(@Param("username") username: string): Promise<UserDto> {
    const user = await this.users.findOne({ username });
    if (!user) throw new UserNotFound(username);

    return user.toDto(PartialUserDto);
  }
}
