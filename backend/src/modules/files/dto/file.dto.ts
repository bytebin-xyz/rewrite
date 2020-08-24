import { Exclude } from "class-transformer";

import { Types } from "mongoose";

import { FolderDto } from "@/modules/folders/dto/folder.dto";

export class FileDto {
  createdAt!: Date;

  deletable!: boolean;

  filename!: string;

  folder!: FolderDto | Types.ObjectId | null;

  @Exclude()
  hidden!: boolean;

  id!: string;

  path!: string;

  public!: boolean;

  size!: number;

  uid!: string;

  updatedAt!: Date;
}
