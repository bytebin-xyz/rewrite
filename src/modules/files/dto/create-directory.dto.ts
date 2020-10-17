import { MaxLength, IsOptional, IsString } from "class-validator";

import { IsStringPathSafe } from "@/validators/is-string-path-safe.validator";

export class CreateDirectoryDto {
  @IsString()
  @IsStringPathSafe()
  @MaxLength(255, {
    message: "Directory name cannot be greater than $constraint1 characters!"
  })
  name!: string;

  @IsOptional()
  @IsString()
  parent!: string | null;
}
