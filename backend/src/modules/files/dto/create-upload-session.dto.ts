import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";

import { UploadSession } from "../schemas/upload-session.schema";

export class CreateUploadSessionDto {
  @IsNotEmpty({ message: "Filename cannot be empty!" })
  @IsString()
  filename!: UploadSession["filename"];

  @IsInt()
  @IsNotEmpty({ message: "File size cannot be empty!" })
  @Min(1, { message: "File size must be at least 1 byte!" })
  size!: UploadSession["size"];
}
