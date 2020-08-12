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
import { UpdateFileDto } from "./dto/update-file.dto";

import { CurrentUser } from "@/decorators/current-user.decorator";
import { OptionalAuth } from "@/decorators/optional-auth";
import { UseScopes } from "@/decorators/scopes.decorator";

import { AuthGuard } from "@/guards/auth.guard";

import { ApplicationScopes } from "@/modules/applications/enums/application-scopes.enum";

import { StorageService } from "@/modules/storage/storage.service";

@Controller("files")
@UseGuards(AuthGuard)
export class FilesController {
  constructor(
    private readonly config: ConfigService,
    private readonly files: FilesService,
    private readonly logger: Logger,
    private readonly storage: StorageService
  ) {}

  @Delete("/:id")
  @UseScopes(ApplicationScopes.FILES_WRITE)
  delete(@CurrentUser("id") uid: string, @Param("id") id: string): Promise<FileDto> {
    return this.files.deleteOne({ id, uid }).then(deleted => deleted.toDto());
  }

  @Patch("/:id")
  @UseScopes(ApplicationScopes.FILES_WRITE)
  updateOne(
    @Body() dto: UpdateFileDto,
    @CurrentUser("id") uid: string,
    @Param("id") id: string
  ): Promise<FileDto> {
    return this.files.updateOne({ id, uid }, dto).then(file => file.toDto());
  }

  @Get("download/:id")
  @OptionalAuth()
  @UseScopes(ApplicationScopes.FILES_READ)
  async download(
    @CurrentUser("id") uid: string | undefined,
    @Param("id") id: string,
    @Res() res: Response
  ): Promise<void> {
    const file = uid
      ? await this.files.findOne({ id, uid })
      : await this.files.findOne({ id, public: true });

    if (!file) throw new FileNotFound();

    const readable = await this.storage.read(file.id);

    readable.on("error", (error: Error) => {
      // Exception handler disabled when using the @Res() decorator, so we have to log the error manually
      this.logger.error(error);

      if (!res.headersSent) {
        const err = new InternalServerErrorException(error);
        res.status(err.getStatus()).send(err.getResponse());
      }
    });

    readable.pipe(res);
  }

  @Post("upload")
  @UseScopes(ApplicationScopes.FILES_WRITE)
  async upload(@CurrentUser("id") uid: string, @Req() req: Request): Promise<FileDto[]> {
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
            uid
          })
          .then(file => file.toDto())
      )
    );
  }
}
