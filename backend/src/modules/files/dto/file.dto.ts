import { Exclude } from "class-transformer";

export class FileDto {
  createdAt!: Date;

  deletable!: boolean;

  filename!: string;

  folder!: string | null;

  @Exclude()
  hidden!: boolean;

  id!: string;

  path!: string;

  public!: boolean;

  size!: number;

  uid!: string;

  updatedAt!: Date;
}
