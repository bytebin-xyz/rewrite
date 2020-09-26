import { ApiProperty } from "@nestjs/swagger";

import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { Transform } from "class-transformer";

import { IsStringPathSafe } from "@/validators/is-string-path-safe.validator";

export class UpdateEntryDto {
  @ApiProperty({
    description:
      "The path of the parent folder. If not specified, it will be moved to the root folder.",
    nullable: true,
    type: String
  })
  @IsOptional()
  @IsString()
  @Transform((value: string) => (value === "/" ? null : value))
  folder: string | null = null;

  @ApiProperty({ description: "The name of this entry." })
  @IsNotEmpty({ message: "Entry name cannot be empty!" })
  @IsString()
  @IsStringPathSafe()
  @MaxLength(255, { message: "Entry name cannot be greater than $constraint1 characters!" })
  name!: string;

  @ApiProperty({ description: "Flag that indicates whether this entry should be public or not." })
  @IsBoolean()
  public!: boolean;
}
