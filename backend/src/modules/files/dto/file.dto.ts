import { Exclude } from "class-transformer";

export class FileDto {
  createdAt!: Date;

  filename!: string;
  
  folder!: string | null;

  @Exclude()
  hidden!: boolean;

  id!: string;

  public!: boolean;

  size!: number;

  uid!: string;

  updatedAt!: Date;
}
