import { IsString } from "class-validator";

import { IsStringPathSafe } from "@/validators/is-string-path-safe.validator";

export class RenameFileDto {
  @IsString()
  @IsStringPathSafe()
  name!: string;
}
