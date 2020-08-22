import { Exclude } from "class-transformer";

import { Types } from "mongoose";

export class FolderDto {
  createdAt!: Date;

  @Exclude()
  hidden!: boolean;

  id!: string;

  name!: string;

  parent!: FolderDto | Types.ObjectId | null;

  public!: boolean;

  uid!: string;

  updatedAt!: Date;
}
