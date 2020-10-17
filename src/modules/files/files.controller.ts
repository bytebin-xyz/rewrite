import { ApiSecurity, ApiTags } from "@nestjs/swagger";

import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards
} from "@nestjs/common";

import { Request, Response } from "express";

import { FileNotFound } from "./files.errors";

import { FilesService } from "./files.service";

import { CreateDirectoryDto } from "./dto/create-directory.dto";
import { CopyFileDto } from "./dto/copy-file.dto";
import { FileDto } from "./dto/file.dto";
import { MoveFileDto } from "./dto/move-file.dto";
import { RenameFileDto } from "./dto/rename-file.dto";
import { UploadedFilesDto } from "./dto/uploaded-files.dto";

import { FileTypes } from "./enums/file-types.enum";

import { config } from "@/config";

import { CurrentUser } from "@/decorators/current-user.decorator";
import { OptionalAuth } from "@/decorators/optional-auth.decorator";
// import { UseScopes } from "@/decorators/use-scopes.decorator";

import { AuthGuard } from "@/guards/auth.guard";

import { StorageService } from "@/modules/storage/storage.service";

@ApiSecurity("api_key")
@ApiTags("files")
@Controller("files")
@UseGuards(AuthGuard)
export class FilesController {
  constructor(
    private readonly files: FilesService,
    private readonly logger: Logger,
    private readonly storage: StorageService
  ) {}

  @Get(":id")
  async get(
    @CurrentUser("id") uid: string,
    @Param("id") id: string
  ): Promise<FileDto> {
    const file = await this.files.findOne({ id, uid });
    if (!file) throw new FileNotFound();

    return file.toDto();
  }

  @Post(":id/copy")
  async copy(
    @Body() dto: CopyFileDto,
    @CurrentUser("id") uid: string,
    @Param("id") id: string
  ): Promise<FileDto> {
    const copied = dto.to
      ? await this.files.copy({ id, uid }, { id: dto.to, uid })
      : await this.files.copy({ id, uid }, { parent: null, uid });

    return copied.toDto();
  }

  @Delete(":id/delete")
  async delete(
    @CurrentUser("id") uid: string,
    @Param("id") id: string
  ): Promise<FileDto> {
    const deleted = await this.files.deleteOne({ id, uid });

    return deleted.toDto();
  }

  @Get(":id/download")
  @OptionalAuth()
  async download(
    @CurrentUser("id") uid: string | undefined,
    @Param("id") id: string,
    @Res() res: Response
  ): Promise<void> {
    const readable = await this.files.createReadable({ id, uid });

    readable.on("error", (error) => {
      // Exception filter won't handle this so we need to manually log it ourselves
      this.logger.error(error);

      if (!res.headersSent) {
        const err = new InternalServerErrorException(error);

        res
          .status(err.getStatus())
          .send(err.getResponse()); // prettier-ignore
      }
    });

    readable.pipe(res);
  }

  @Patch(":id/move")
  async move(
    @Body() dto: MoveFileDto,
    @CurrentUser("id") uid: string,
    @Param("id") id: string
  ): Promise<FileDto> {
    const moved = dto.to
      ? await this.files.move({ id, uid }, { id: dto.to, uid })
      : await this.files.move({ id, uid }, { parent: null, uid });

    return moved.toDto();
  }

  @Patch(":id/rename")
  async rename(
    @Body() dto: RenameFileDto,
    @CurrentUser("id") uid: string,
    @Param("id") id: string
  ): Promise<FileDto> {
    const renamed = await this.files.rename({ id, uid }, dto.name);

    return renamed.toDto();
  }

  @Post("create-directory")
  async create(
    @Body() dto: CreateDirectoryDto,
    @CurrentUser("id") uid: string,
    @Query("autorename", new DefaultValuePipe(false), ParseBoolPipe)
    autorename: boolean
  ): Promise<FileDto> {
    const folder = await this.files.create(
      {
        ...dto,
        capabilities: {
          canAddChildren: true,
          canCopy: false,
          canDelete: true,
          canDownload: false,
          canMove: true,
          canRemoveChildren: true,
          canRename: true,
          canShare: true
        },
        type: FileTypes.Directory,
        uid,
        writtenTo: null
      },
      {
        autorename
      }
    );

    return folder.toDto();
  }

  @Post("upload")
  async upload(
    @CurrentUser("id") uid: string,
    @Query("autorename", new DefaultValuePipe(true), ParseBoolPipe)
    autorename: boolean,
    @Query("parent", new DefaultValuePipe(null)) parent: string | null,
    @Req() req: Request
  ): Promise<UploadedFilesDto> {
    const filesWritten = await this.storage.write(req, {
      field: "file",
      limits: {
        files: config.get("limits").maxFilesPerUpload,
        fileSize: config.get("limits").maxFileSize
      }
    });

    const failed: UploadedFilesDto["failed"] = [];
    const succeeded: UploadedFilesDto["succeeded"] = [];
    const tasks: Promise<void>[] = [];

    for (const fileWritten of filesWritten) {
      const handleError = (error: Error) => {
        failed.push({
          error: error.message,
          file: {
            mimetype: fileWritten.mimetype,
            name: fileWritten.filename,
            size: fileWritten.size
          }
        });
      };

      tasks.push(
        this.files
          .create(
            {
              capabilities: {
                canAddChildren: false,
                canCopy: true,
                canDelete: true,
                canDownload: true,
                canMove: true,
                canRemoveChildren: false,
                canRename: true,
                canShare: true
              },
              name: fileWritten.filename,
              parent,
              size: fileWritten.size,
              type: FileTypes.File,
              uid,
              writtenTo: fileWritten.id
            },
            {
              autorename
            }
          )
          .then((file) => {
            succeeded.push(file.toDto());
          })
          .catch((error: Error) =>
            this.storage
              .delete(fileWritten.id)
              .then(() => handleError(error))
              .catch((err) => handleError(err))
          )
      );
    }

    await Promise.all(tasks);

    return {
      failed,
      succeeded
    };
  }
}
