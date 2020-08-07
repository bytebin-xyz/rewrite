import { Controller, Post, UseGuards, Body, Delete, Param } from "@nestjs/common";

import { ApplicationsService } from "./applications.service";

import { ApplicationDto } from "./dto/application.dto";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { GenerateApplicationTokenDto } from "./dto/generate-application-token.dto";

import { CurrentUser } from "@/decorators/current-user.decorator";

import { AuthGuard } from "@/guards/auth.guard";

import { User } from "@/modules/users/schemas/user.schema";

@Controller("applications")
@UseGuards(AuthGuard)
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Post()
  create(@Body() dto: CreateApplicationDto, @CurrentUser() user: User): Promise<ApplicationDto> {
    return this.applications.create(dto.name, user.id).then(application => application.toDto());
  }

  @Delete("/:id")
  delete(@CurrentUser() user: User, @Param("id") id: string): Promise<ApplicationDto> {
    return this.applications.delete(id, user.id).then(application => application.toDto());
  }

  @Post("/:id/token")
  generateToken(
    @CurrentUser() user: User,
    @Param("id") id: string
  ): Promise<GenerateApplicationTokenDto> {
    return this.applications.generateToken(id, user.id);
  }
}
