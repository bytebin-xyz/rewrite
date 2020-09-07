import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";

import { Exclude } from "class-transformer";

export class UserDto {
  @ApiHideProperty()
  @Exclude()
  activated!: boolean;

  admin!: boolean;

  @ApiProperty({ nullable: true, type: String })
  avatar!: string | null;

  createdAt!: Date;

  @ApiHideProperty()
  @Exclude()
  deleted!: boolean;

  displayName!: string;

  email!: string;

  @ApiHideProperty()
  @Exclude()
  expiresAt!: Date | null;

  id!: string;

  @ApiHideProperty()
  @Exclude()
  password!: string;

  @ApiHideProperty()
  @Exclude()
  updatedAt!: Date;

  username!: string;
}
