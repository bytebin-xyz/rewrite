import { ApiProperty } from "@nestjs/swagger";

export class PartialUserDto {
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

  @ApiProperty({ description: "The user's display name. This can differ from their username." })
  displayName!: string;

  @ApiProperty({ description: "A unique identifier for this user." })
  id!: string;

  @ApiProperty({
    description:
      "The username for this user. The username is always lowercase and cannot be changed."
  })
  username!: string;
}
