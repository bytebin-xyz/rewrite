import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";

import { FolderNotFound } from "./folders.errors";
import { FoldersService } from "./folders.service";

import { CreateFolderDto } from "./dto/create-folder.dto";
import { FolderDto } from "./dto/folder.dto";

import { CurrentUser } from "@/decorators/current-user.decorator";

import { AuthGuard } from "@/guards/auth.guard";

@Controller("folders")
@UseGuards(AuthGuard)
export class FoldersController {
  constructor(private readonly folders: FoldersService) {}

  @Post()
  create(@Body() dto: CreateFolderDto, @CurrentUser("id") uid: string): Promise<FolderDto> {
    return this.folders.create(dto, uid).then(folder => folder.toDto());
  }

  @Delete("/:id")
  deleteOne(@CurrentUser("id") uid: string, @Param("id") id: string): Promise<FolderDto> {
    return this.folders.deleteOne({ id, uid }).then(folder => folder.toDto());
  }

  @Get("/:id")
  async findOne(@CurrentUser("id") uid: string, @Param("id") id: string): Promise<FolderDto> {
    const folder = await this.folders.findOne({ id, uid });
    if (!folder) throw new FolderNotFound();

    return folder.toDto();
  }

  @Patch("/:id")
  async updateOne(
    @Body() dto: CreateFolderDto,
    @CurrentUser("id") uid: string,
    @Param("id") id: string
  ): Promise<FolderDto> {
    return this.folders.updateOne({ id, uid }, dto).then(folder => folder.toDto());
  }
}
