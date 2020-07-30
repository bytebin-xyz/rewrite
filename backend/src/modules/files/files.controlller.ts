import path from "path";
import pump from "pump";

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";

import { ConfigService } from "@nestjs/config";

import { FilesInterceptor } from "@nestjs/platform-express";

import { Request, Response } from "express";

import { Throttle } from "nestjs-throttler";

import { FilesService } from "./files.service";

import { CreateUploadSessionDto } from "./dto/create-upload-session.dto";
import { FileDto } from "./dto/file.dto";
import { RenameFileDto } from "./dto/rename-file.dto";
import { UploadSessionDto } from "./dto/upload-session.dto";

import { CurrentUser } from "@/decorators/current-user.decorator";

import { AuthGuard } from "@/guards/auth.guard";

import { User } from "@/modules/users/schemas/user.schema";

import { DiskFile } from "@/storage/disk.storage";

import { pathFromString } from "@/utils/pathFromString";

@Controller("files")
export class FilesController {
  constructor(private readonly config: ConfigService, private readonly files: FilesService) {}

  @Delete("delete/:id")
  @UseGuards(AuthGuard)
  delete(@CurrentUser() user: User, @Param("id") id: string): Promise<FileDto> {
    return this.files.delete(id, user.id).then(deleted => deleted.toDto());
  }

  @Get("download/:id")
  @UseGuards(AuthGuard)
  async download(
    @CurrentUser() user: User | undefined,
    @Param("id") id: string,
    @Res() res: Response
  ): Promise<void> {
    const stream = await this.files.createDownloadStream(id, user && user.id);

    await pump(stream, res);
  }

  @Patch("rename/:id")
  @UseGuards(AuthGuard)
  rename(
    @Body() { newFilename }: RenameFileDto,
    @CurrentUser() user: User,
    @Param("id") id: string
  ): Promise<FileDto> {
    return this.files.rename(id, newFilename, user.id).then(file => file.toDto());
  }

  @Post("upload")
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor("file"))
  async upload(
    @CurrentUser() user: User,
    @UploadedFiles() uploadedFile: DiskFile[]
  ): Promise<FileDto[]> {
    const files: (() => Promise<FileDto>)[] = [];

    for (const file of uploadedFile) {
      files.push(() =>
        this.files
          .create(
            file.originalname,
            path.join(pathFromString(file.filename), file.filename),
            file.size,
            user.id
          )
          .then(file => file.toDto())
      );
    }

    return Promise.all(files.map(fn => fn()));
  }

  @Post("upload-session")
  @UseGuards(AuthGuard)
  createUploadSession(
    @Body() dto: CreateUploadSessionDto,
    @CurrentUser() user: User
  ): Promise<UploadSessionDto> {
    return this.files
      .createUploadSession(dto.filename, dto.size, user.id)
      .then(uploadSession => uploadSession.toDto());
  }

  @Post("upload-session/:id")
  @UseGuards(AuthGuard)
  commitUploadSession(@CurrentUser() user: User, @Param("id") id: string): Promise<FileDto> {
    return this.files.commitUploadSession(id, user.id).then(file => file.toDto());
  }

  @Delete("upload-session/:id")
  @UseGuards(AuthGuard)
  destroyUploadSession(
    @CurrentUser() user: User,
    @Param("id") id: string
  ): Promise<UploadSessionDto> {
    return this.files.destroyUploadSession(id, user.id).then(deleted => deleted.toDto());
  }

  @Post("upload-session/:id/chunk/:chunkIndex")
  @Throttle(200, 60) // Allow 200 chunks to be sent within a minute
  @UseGuards(AuthGuard)
  writeChunk(
    @CurrentUser() user: User,
    @Param("chunkIndex") chunkIndex: number,
    @Param("id") id: string,
    @Req() req: Request
  ): Promise<UploadSessionDto> {
    return this.files
      .writeChunk(id, req, chunkIndex, user.id)
      .then(uploadSession => uploadSession.toDto());
  }
}
