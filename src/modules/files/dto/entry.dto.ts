import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";

import { Exclude } from "class-transformer";

export class EntryDto {
  @ApiProperty({
    description: "The time of which this entry was created.",
    example: new Date()
  })
  createdAt!: Date;

  @ApiProperty({ description: "Flag that indicates whether this entry can be deleted." })
  deletable!: boolean;

  @ApiProperty({
    description:
      "The depth of where this entry located in the user's filesystem. It will always return an integer greater than 0.",
    example: 1,
    minimum: 1
  })
  depth!: number;

  @ApiProperty({
    description:
      "The ID of the parent folder. If the parent is the root folder, then null will be returned.",
    nullable: true,
    type: String
  })
  folder!: string | null;

  @ApiHideProperty()
  @Exclude()
  hidden!: boolean;

  @ApiProperty({ description: "A unique identifier for this entry." })
  id!: string;

  @ApiProperty({
    description: "Flag that indicates whether this entry is a file.",
    example: false
  })
  isFile!: boolean;

  @ApiProperty({
    description: "Flag that indicates whether this entry is a folder.",
    example: true
  })
  isFolder!: boolean;

  @ApiProperty({ description: "The name of this entry." })
  name!: string;

  @ApiProperty({
    description:
      "The path to this entry in the user's filesystem. It will always start with a forward slash.",
    example: "/hello"
  })
  path!: string;

  @ApiProperty({ description: "Flag that indicates whether this entry is public or not." })
  public!: boolean;

  @ApiProperty({
    description:
      "The size of this entry in bytes. If the entry is a folder, the size will always be 0."
  })
  size!: number;

  @ApiProperty({
    description: "The UNIX timestamp of when this entry was last modified.",
    example: Date.now()
  })
  timestamp!: number;

  @ApiProperty({ description: "The ID of the user that created this entry." })
  uid!: string;

  @ApiProperty({
    description: "The time of which this entry was last modified.",
    example: new Date()
  })
  updatedAt!: Date;
}
