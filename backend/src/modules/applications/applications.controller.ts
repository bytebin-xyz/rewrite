import { ApiExcludeEndpoint } from "@nestjs/swagger";
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";

import { Throttle } from "nestjs-throttler";

import { ApplicationsService } from "./applications.service";

import { ApplicationDto } from "./dto/application.dto";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { GenerateApplicationKeyDto } from "./dto/generate-application-key.dto";

import { CurrentUser } from "@/decorators/current-user.decorator";

import { AuthGuard } from "@/guards/auth.guard";

@Controller("applications")
@UseGuards(AuthGuard)
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @ApiExcludeEndpoint()
  @Get()
  all(@CurrentUser("id") uid: string): Promise<ApplicationDto[]> {
    return this.applications
      .find({ uid })
      .then(applications => applications.map(application => application.toDto()));
  }

  @ApiExcludeEndpoint()
  @Post()
  @Throttle(25, 60)
  create(
    @Body() dto: CreateApplicationDto,
    @CurrentUser("id") uid: string
  ): Promise<ApplicationDto> {
    return this.applications.create({ ...dto, uid }).then(application => application.toDto());
  }

  @ApiExcludeEndpoint()
  @Delete("/:id")
  deleteOne(@CurrentUser("id") uid: string, @Param("id") id: string): Promise<ApplicationDto> {
    return this.applications.deleteOne({ id, uid }).then(application => application.toDto());
  }

  @ApiExcludeEndpoint()
  @Patch("/:id")
  updateOne(
    @Body() dto: CreateApplicationDto,
    @CurrentUser("id") uid: string,
    @Param("id") id: string
  ): Promise<ApplicationDto> {
    return this.applications.updateOne({ id, uid }, dto).then(application => application.toDto());
  }

  @ApiExcludeEndpoint()
  @Post("/:id/key")
  @Throttle(25, 60)
  async generateKey(
    @CurrentUser("id") uid: string,
    @Param("id") id: string
  ): Promise<GenerateApplicationKeyDto> {
    return {
      key: await this.applications.generateKey({ id, uid })
    };
  }
}
