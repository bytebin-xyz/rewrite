import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Req,
  Res,
  Query,
  UseGuards
} from "@nestjs/common";

import { ConfigService } from "@nestjs/config";

import { Request, Response } from "express";

import { EntryNotFound, ParentDirectoryNotFound } from "./files.errors";
import { FilesService } from "./files.service";

import { CreateDirectoryEntryDto } from "./dto/create-directory-entry.dto";
import { EntryDto } from "./dto/entry.dto";
import { UpdateEntryDto } from "./dto/update-entry.dto";

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
  deleteOne(@CurrentUser("id") uid: string, @Param("id") id: string): Promise<EntryDto> {
    return this.files.deleteOne({ id, uid }).then(deleted => deleted.toDto());
  }

  @Patch("/:id")
  @UseScopes(ApplicationScopes.FILES_WRITE)
  updateOne(
    @Body() dto: UpdateEntryDto,
    @CurrentUser("id") uid: string,
    @Param("id") id: string
  ): Promise<EntryDto> {
    return this.files
      .updateOne({ id, uid }, { ...dto, deletable: true, hidden: false })
      .then(file => file.toDto());
  }

  @Post("create-directory")
  @UseScopes(ApplicationScopes.FILES_WRITE)
  createDirectory(
    @Body() dto: CreateDirectoryEntryDto,
    @CurrentUser("id") uid: string
  ): Promise<EntryDto> {
    return this.files
      .createEntry({
        deletable: true,
        hidden: false,
        isDirectory: true,
        isFile: false,
        name: dto.name,
        parent: dto.parent,
        public: dto.public,
        size: 0,
        uid
      })
      .then(entry => entry.toDto());
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

    if (!file) throw new EntryNotFound();

    const readable = await this.storage.read(file.id);

    readable.on("error", (error: Error) => {
      // Exception filter disabled when using the @Res() decorator, so we have to log the error manually
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
  async upload(
    @CurrentUser("id") uid: string,
    @Query("folder") folder: string,
    @Query("public", ParseBoolPipe) isPublic: boolean,
    @Req() req: Request
  ): Promise<EntryDto[]> {
    if (!(await this.files.exists({ id: folder, uid }))) {
      throw new ParentDirectoryNotFound();
    }

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
          .createEntry({
            deletable: true,
            hidden: false,
            id: file.id,
            isDirectory: false,
            isFile: true,
            name: file.filename,
            parent: folder,
            public: isPublic,
            size: file.size,
            uid
          })
          .then(file => file.toDto())
      )
    );
  }
}
