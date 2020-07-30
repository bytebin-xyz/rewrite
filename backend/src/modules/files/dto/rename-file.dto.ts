import { IsNotEmpty, IsString } from "class-validator";

import { File } from "../schemas/file.schema";

export class RenameFileDto {
  @IsNotEmpty({ message: "New filename cannot be empty!" })
  @IsString()
  newFilename!: File["filename"];
}
