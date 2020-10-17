import { Exclude } from "class-transformer";

import { FileTypes } from "../enums/file-types.enum";

export class FileDto {
  capabilities!: {
    canAddChildren: boolean;
    canCopy: boolean;
    canDelete: boolean;
    canDownload: boolean;
    canMove: boolean;
    canRemoveChildren: boolean;
    canRename: boolean;
    canShare: boolean;
  };

  createdAt!: Date;

  id!: string;

  name!: string;

  parent!: string | null;

  path!: string;

  size!: number;

  @Exclude()
  state!: {
    isDeleted: boolean;
  };

  type!: FileTypes;

  uid!: string;

  updatedAt!: Date;

  @Exclude()
  writtenTo!: string | null;
}
