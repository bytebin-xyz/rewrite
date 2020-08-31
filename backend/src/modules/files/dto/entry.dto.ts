import { Exclude } from "class-transformer";

export class EntryDto {
  createdAt!: Date;

  deepness!: number;

  deletable!: boolean;

  @Exclude()
  hidden!: boolean;

  id!: string;

  isDirectory!: boolean;

  isFile!: boolean;

  name!: string;

  parent!: string | null;

  path!: string;

  public!: boolean;

  uid!: string;

  updatedAt!: Date;
}
