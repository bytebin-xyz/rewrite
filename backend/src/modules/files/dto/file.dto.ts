import { Exclude } from "class-transformer";

export class FileDto {
  createdAt!: Date;

  filename!: string;

  id!: string;

  @Exclude()
  partialPath!: string;

  size!: number;

  uid!: string;

  updatedAt!: Date;
}
