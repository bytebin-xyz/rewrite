import { ConfigService } from "@nestjs/config";

import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";

import { FileInterceptor } from "@nestjs/platform-express";

import { Throttle, ThrottlerGuard } from "nestjs-throttler";

import { AuthGuard } from "@/modules/auth/guards/auth.guard";

@Controller("files")
@UseGuards(ThrottlerGuard)
export class FilesController {
  constructor(private readonly config: ConfigService) {}

  @Delete("delete/:id")
  @Throttle(10, 60)
  @UseGuards(AuthGuard)
  delete(@Param("id") id: string) {}

  @Get("download/:id")
  @Throttle(1, 60)
  download(@Param("id") id: string) {}

  @Patch("update/:id")
  @Throttle(10, 60)
  @UseGuards(AuthGuard)
  update(@Param("id") id: string) {}

  @Post("upload")
  @Throttle(1, 60)
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  upload() {}
}
