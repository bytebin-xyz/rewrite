import { Exclude } from "class-transformer";

export class UserDto {
  @Exclude()
  activated!: boolean;

  admin!: boolean;

  avatar!: string | null;

  createdAt!: Date;

  @Exclude()
  deleted!: boolean;

  displayName!: string;

  email!: string;

  @Exclude()
  expiresAt!: Date | null;

  id!: string;

  @Exclude()
  password!: string;

  @Exclude()
  updatedAt!: Date;

  username!: string;
}
