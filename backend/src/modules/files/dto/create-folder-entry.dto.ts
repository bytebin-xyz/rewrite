import { ApiProperty } from "@nestjs/swagger";

import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

import { IsStringPathSafe } from "@/validators/is-string-path-safe.validator";

export class CreateFolderEntryDto {
  @ApiProperty({
    description:
      "The ID of the parent folder. You can set the value as null to create it in the root folder.",
    nullable: true,
    type: String
  })
  @IsOptional()
  @IsString()
  folder!: string | null;

  @ApiProperty({ description: "The name of this folder." })
  @IsNotEmpty({ message: "Folder name cannot be empty!" })
  @IsString()
  @IsStringPathSafe()
  @MaxLength(255, { message: "Folder name cannot be greater than $constraint1 characters!" })
  name!: string;

  @ApiProperty({ description: "Flag that indicates whether this folder should be public or not." })
  @IsBoolean()
  public!: boolean;
}
