import { Exclude } from "class-transformer";

export class EntryDto {
  createdAt!: Date;

  deletable!: boolean;

  depth!: number;

  folder!: string | null;

  @Exclude()
  hidden!: boolean;

  id!: string;

  isFile!: boolean;

  isFolder!: boolean;

  name!: string;

  path!: string;

  public!: boolean;

  size!: number;

  timestamp!: number;

  uid!: string;

  updatedAt!: Date;
}
