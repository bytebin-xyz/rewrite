import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

import { IsStringPathSafe } from "@/validators/is-string-path-safe.validator";

export class CreateDirectoryEntryDto {
  @IsNotEmpty({ message: "Directory name cannot be empty!" })
  @IsString()
  @IsStringPathSafe()
  @MaxLength(255, { message: "Directory name cannot be greater than $constraint1 characters!" })
  name!: string;

  @IsOptional()
  @IsString()
  parent!: string | null;

  @IsBoolean()
  public!: boolean;
}
