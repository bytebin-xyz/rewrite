import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";

import { Throttle } from "nestjs-throttler";

import { ApplicationsService } from "./applications.service";

import { ApplicationDto } from "./dto/application.dto";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { GenerateApplicationKeyDto } from "./dto/generate-application-key.dto";
import { UpdateApplicationScopesDto } from "./dto/update-application-scopes.dto";

import { CurrentUser } from "@/decorators/current-user.decorator";

import { AuthGuard } from "@/guards/auth.guard";

import { User } from "@/modules/users/schemas/user.schema";

@Controller("applications")
@UseGuards(AuthGuard)
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Get()
  all(@CurrentUser() user: User): Promise<ApplicationDto[]> {
    return this.applications
      .find(user.id)
      .then(applications => applications.map(application => application.toDto()));
  }

  @Post()
  @Throttle(25, 60)
  create(@Body() dto: CreateApplicationDto, @CurrentUser() user: User): Promise<ApplicationDto> {
    return this.applications
      .create(dto.name, dto.scopes || [], user.id)
      .then(application => application.toDto());
  }

  @Delete("/:id")
  delete(@CurrentUser() user: User, @Param("id") id: string): Promise<ApplicationDto> {
    return this.applications.delete(id, user.id).then(application => application.toDto());
  }

  @Post("/:id/key")
  @Throttle(25, 60)
  async generateKey(
    @CurrentUser() user: User,
    @Param("id") id: string
  ): Promise<GenerateApplicationKeyDto> {
    return { key: await this.applications.generateKey(id, user.id) };
  }

  @Patch("/:id/scopes")
  updateScopes(
    @Body() dto: UpdateApplicationScopesDto,
    @CurrentUser() user: User,
    @Param("id") id: string
  ): Promise<ApplicationDto> {
    return this.applications
      .updateScopes(id, dto.scopes, user.id)
      .then(application => application.toDto());
  }
}
