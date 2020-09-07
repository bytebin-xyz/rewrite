import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from "@nestjs/swagger";

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
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  Query,
  UseGuards
} from "@nestjs/common";

import { ConfigService } from "@nestjs/config";

import { Request, Response } from "express";

import {
  EntryAlreadyExists,
  EntryNotDeletable,
  EntryNotFound,
  ParentFolderNotFound,
  ParentIsChildrenOfItself,
  ParentIsItself
} from "./files.errors";

import { FilesService } from "./files.service";

import { CreateFolderEntryDto } from "./dto/create-folder-entry.dto";
import { EntryDto } from "./dto/entry.dto";
import { FileUploadDto } from "./dto/file-upload.dto";
import { UpdateEntryDto } from "./dto/update-entry.dto";

import { CurrentUser } from "@/decorators/current-user.decorator";
import { OptionalAuth } from "@/decorators/optional-auth";
import { UseScopes } from "@/decorators/scopes.decorator";

import { PaginationDto } from "@/dto/pagination.dto";

import { AuthGuard } from "@/guards/auth.guard";

import { ApplicationScopes } from "@/modules/applications/enums/application-scopes.enum";

import {
  FileTooLarge,
  NoFilesUploaded,
  TooManyFields,
  TooManyFiles,
  TooManyParts,
  UnsupportedContentType
} from "@/modules/storage/storage.errors";

import { StorageService } from "@/modules/storage/storage.service";

@ApiTags("Files")
@Controller("files")
@UseGuards(AuthGuard)
export class FilesController {
  constructor(
    private readonly config: ConfigService,
    private readonly files: FilesService,
    private readonly logger: Logger,
    private readonly storage: StorageService
  ) {}

  @Delete("/:id/delete")
  @ApiResponse({ description: EntryNotDeletable.message, status: EntryNotDeletable.status })
  @ApiResponse({ description: EntryNotFound.message, status: EntryNotFound.status })
  @UseScopes(ApplicationScopes.FILES_WRITE)
  async deleteOne(@CurrentUser("id") uid: string, @Param("id") id: string): Promise<EntryDto> {
    const deleted = await this.files.deleteOne({ id, uid });

    return deleted.toDto();
  }

  @Get("/:id/details")
  @ApiResponse({ description: EntryNotFound.message, status: EntryNotFound.status })
  @UseScopes(ApplicationScopes.FILES_READ)
  async findOne(@CurrentUser("id") uid: string, @Param("id") id: string): Promise<EntryDto> {
    const entry = await this.files.findOne({ id, uid });
    if (!entry) throw new EntryNotFound();

    return entry.toDto();
  }

  @Get("/:id/download")
  @ApiResponse({ description: EntryNotFound.message, status: EntryNotFound.status })
  @OptionalAuth()
  @UseScopes(ApplicationScopes.FILES_READ)
  async download(
    @CurrentUser("id") uid: string | undefined,
    @Param("id") id: string,
    @Res() res: Response
  ): Promise<void> {
    const readable = await this.files.createReadable(id, uid);

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

  @Patch("/:id/update")
  @ApiResponse({ description: EntryAlreadyExists.message, status: EntryAlreadyExists.status })
  @ApiResponse({ description: EntryNotFound.message, status: EntryNotFound.status })
  @ApiResponse({ description: ParentFolderNotFound.message, status: ParentFolderNotFound.status })
  @ApiResponse({ description: ParentIsChildrenOfItself.message, status: ParentIsChildrenOfItself.status }) // prettier-ignore
  @ApiResponse({ description: ParentIsItself.message, status: ParentIsItself.status })
  @UseScopes(ApplicationScopes.FILES_WRITE)
  async updateOne(
    @Body() dto: UpdateEntryDto,
    @CurrentUser("id") uid: string,
    @Param("id") id: string
  ): Promise<EntryDto> {
    const entry = await this.files.updateOne(
      { id, uid },
      { ...dto, deletable: true, hidden: false }
    );

    return entry.toDto();
  }

  @Post("create-folder")
  @ApiResponse({ description: EntryAlreadyExists.message, status: EntryAlreadyExists.status })
  @ApiResponse({ description: ParentFolderNotFound.message, status: ParentFolderNotFound.status })
  @UseScopes(ApplicationScopes.FILES_WRITE)
  async createFolder(
    @Body() dto: CreateFolderEntryDto,
    @CurrentUser("id") uid: string
  ): Promise<EntryDto> {
    const folder = await this.files.createEntry({
      deletable: true,
      folder: dto.folder,
      hidden: false,
      isFile: false,
      isFolder: true,
      name: dto.name,
      public: dto.public,
      size: 0,
      uid
    });

    return folder.toDto();
  }

  @Get("list")
  @UseScopes(ApplicationScopes.FILES_READ)
  async list(
    @CurrentUser("id") uid: string,
    @Query("cursor", new DefaultValuePipe(0), ParseIntPipe) cursor: number,
    @Query("folder", new DefaultValuePipe(null)) folder: string | null,
    @Query("limit", new DefaultValuePipe(50), ParseIntPipe) limit: number
  ): Promise<PaginationDto<EntryDto>> {
    const entries = await this.files.list({ folder, uid }, { cursor, limit });

    return {
      ...entries,
      items: entries.items.map((entry) => entry.toDto())
    };
  }

  @Post("upload")
  @ApiBody({ type: FileUploadDto })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ description: ParentFolderNotFound.message, status: ParentFolderNotFound.status })
  @UseScopes(ApplicationScopes.FILES_WRITE)
  async upload(
    @CurrentUser("id") uid: string,
    @Query("folder") folder: string | null,
    @Query("public", ParseBoolPipe) isPublic: boolean,
    @Req() req: Request
  ): Promise<EntryDto[]> {
    if (folder && !(await this.files.exists({ id: folder, uid }))) {
      throw new ParentFolderNotFound();
    }

    const files = await this.storage.write(req, {
      field: "file",
      limits: {
        files: this.config.get("MAX_FILES_PER_UPLOAD"),
        fileSize: this.config.get("MAX_FILE_SIZE")
      }
    });

    return Promise.all(
      files.map((file) =>
        this.files
          .createEntry({
            deletable: true,
            folder,
            hidden: false,
            id: file.id,
            isFile: true,
            isFolder: false,
            name: file.filename,
            public: isPublic,
            size: file.size,
            uid
          })
          .then((file) => file.toDto())
      )
    );
  }
}
