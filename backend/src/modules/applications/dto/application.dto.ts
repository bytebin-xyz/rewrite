import { Exclude } from "class-transformer";

export class ApplicationDto {
  createdAt!: Date;

  id!: string;

  name!: string;

  token!: string | null;

  @Exclude()
  updatedAt!: Date;
}
