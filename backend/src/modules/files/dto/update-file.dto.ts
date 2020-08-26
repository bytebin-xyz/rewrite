import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

import { IsStringPathSafe } from "@/validators/is-string-path-safe.validator";

export class UpdateFileDto {
  @IsNotEmpty({ message: "New filename cannot be empty!" })
  @IsString()
  @IsStringPathSafe()
  @MaxLength(255, { message: "Filename cannot be greater than $constraint1 characters!" })
  filename!: string;

  @IsOptional()
  @IsString()
  folder!: string | null;

  @IsBoolean()
  public!: boolean;
}
