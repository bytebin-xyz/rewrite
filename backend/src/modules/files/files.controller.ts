import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards
} from "@nestjs/common";

import { ConfigService } from "@nestjs/config";

import { Request, Response } from "express";

import { FileNotFound } from "./files.errors";
import { FilesService } from "./files.service";

import { FileDto } from "./dto/file.dto";
import { RenameFileDto } from "./dto/rename-file.dto";

import { CurrentUser } from "@/decorators/current-user.decorator";
import { OptionalAuth } from "@/decorators/auth-optional.decorator";

import { AuthGuard } from "@/guards/auth.guard";

import { StorageService } from "@/modules/storage/storage.service";

import { User } from "@/modules/users/schemas/user.schema";

@Controller("files")
@UseGuards(AuthGuard)
export class FilesController {
  constructor(
    private readonly config: ConfigService,
    private readonly files: FilesService,
    private readonly logger: Logger,
    private readonly storage: StorageService
  ) {}

  @Delete("delete/:id")
  delete(@CurrentUser() user: User, @Param("id") id: string): Promise<FileDto> {
    return this.files.delete(id, user.id).then(deleted => deleted.toDto());
  }

  @Get("download/:id")
  @OptionalAuth()
  async download(
    @CurrentUser() user: User | undefined,
    @Param("id") id: string,
    @Res() res: Response
  ): Promise<void> {
    const file = user ? await this.files.findOne(id, user.id) : await this.files.findPublicFile(id);
    if (!file) throw new FileNotFound(id);

    const readable = await this.storage.read(file.id);

    readable.on("error", (error: NodeJS.ErrnoException & Error) => {
      // prettier-ignore
      const err = error.code === "ENOENT"
        ? new FileNotFound(id) 
        : new InternalServerErrorException(error);

      // Exception handler disabled when using the @Res() decorator, so we have to log the error manually
      if (err instanceof InternalServerErrorException) {
        this.logger.error(error);
      }

      if (!res.headersSent) {
        res.status(err.getStatus()).send(err.getResponse());
      }
    });

    readable.pipe(res);
  }

  @Patch("rename/:id")
  rename(
    @Body() { newFilename }: RenameFileDto,
    @CurrentUser() user: User,
    @Param("id") id: string
  ): Promise<FileDto> {
    return this.files.rename(id, newFilename, user.id).then(file => file.toDto());
  }

  @Post("upload")
  async upload(@CurrentUser() user: User, @Req() req: Request): Promise<FileDto[]> {
    const files = await this.storage.write(req, {
      field: "file",
      limits: {
        files: this.config.get("MAX_FILES_PER_UPLOAD"),
        fileSize: this.config.get("MAX_FILE_SIZE")
      }
    });

    return Promise.all(
      files.map(file =>
        this.files
          .create({
            filename: file.filename,
            id: file.id,
            size: file.size,
            uid: user.id
          })
          .then(file => file.toDto())
      )
    );
  }
}
