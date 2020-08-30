import escapeRegExp from "lodash.escaperegexp";

import { IsString } from "class-validator";
import { Transform } from "class-transformer";

import { IsStringValidPath } from "@/validators/is-string-valid-path.validator";

export class DeleteFilesDto {
  @IsString()
  @IsStringValidPath()
  @Transform((value: string) => escapeRegExp(value))
  path!: string;
}
