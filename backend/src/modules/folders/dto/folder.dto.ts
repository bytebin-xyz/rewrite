import { Exclude } from "class-transformer";

import { Types } from "mongoose";

export class FolderDto {
  createdAt!: Date;

  deepness!: number;

  @Exclude()
  hidden!: boolean;

  id!: string;

  name!: string;

  parent!: FolderDto | Types.ObjectId | null;

  path!: string;

  public!: boolean;

  uid!: string;

  updatedAt!: Date;
}
