import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";

import { Exclude } from "class-transformer";

export class UserDto {
  @ApiHideProperty()
  @Exclude()
  activated!: boolean;

  @ApiProperty({
    description: "Flag that indicates whether this user is an admin or not.",
    example: false
  })
  admin!: boolean;

  @ApiProperty({
    description:
      "The file ID that points to the user's avatar. If the user has no avatar, null will be returned.",
    nullable: true,
    type: String
  })
  avatar!: string | null;

  @ApiProperty({
    description: "The time of which this user created their account.",
    example: new Date()
  })
  createdAt!: Date;

  @ApiHideProperty()
  @Exclude()
  deleted!: boolean;

  @ApiProperty({
    description: "The user's display name. This can differ from their username."
  })
  displayName!: string;

  @ApiProperty({
    description: "The email that was used to create this account."
  })
  email!: string;

  @ApiHideProperty()
  @Exclude()
  expiresAt!: Date | null;

  @ApiProperty({ description: "A unique identifier for this user." })
  id!: string;

  @ApiHideProperty()
  @Exclude()
  password!: string;

  @ApiHideProperty()
  @Exclude()
  updatedAt!: Date;

  @ApiProperty({
    description:
      "The username for this user. The username is always lowercase and cannot be changed."
  })
  username!: string;
}
