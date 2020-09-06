import { ApiProperty } from "@nestjs/swagger";

import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

import { IsStringPathSafe } from "@/validators/is-string-path-safe.validator";

export class UpdateEntryDto {
  @ApiProperty({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  folder!: string | null;

  @IsNotEmpty({ message: "Entry name cannot be empty!" })
  @IsString()
  @IsStringPathSafe()
  @MaxLength(255, { message: "Entry name cannot be greater than $constraint1 characters!" })
  name!: string;

  @IsBoolean()
  public!: boolean;
}