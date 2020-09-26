import { ApiProperty } from "@nestjs/swagger";

import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { Transform } from "class-transformer";

import { IsStringPathSafe } from "@/validators/is-string-path-safe.validator";

export class CreateFolderEntryDto {
  @ApiProperty({ description: "The name of this folder." })
  @IsNotEmpty({ message: "Folder name cannot be empty!" })
  @IsString()
  @IsStringPathSafe()
  @MaxLength(255, { message: "Folder name cannot be greater than $constraint1 characters!" })
  name!: string;

  @ApiProperty({
    description:
      "The path of the parent folder. If not specified, it will be created in the root folder",
    nullable: true,
    type: String
  })
  @IsOptional()
  @IsString()
  @Transform((value: string) => (value === "/" ? null : value))
  path: string | null = null;

  @ApiProperty({ description: "Flag that indicates whether this folder should be public or not." })
  @IsBoolean()
  public!: boolean;
}
