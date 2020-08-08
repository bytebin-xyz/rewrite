import { Exclude } from "class-transformer";

export class ApplicationDto {
  createdAt!: Date;

  id!: string;

  key!: string | null;

  lastUsed!: Date | null;

  name!: string;

  @Exclude()
  updatedAt!: Date;
}
