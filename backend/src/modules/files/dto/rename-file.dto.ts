import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class RenameFileDto {
  @IsNotEmpty({ message: "New filename cannot be empty!" })
  @IsString()
  @MaxLength(255, { message: "Filename cannot be greater than $constraint1 characters!" })
  newFilename!: string;
}
