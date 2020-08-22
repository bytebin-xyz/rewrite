import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateFolderDto {
  @IsNotEmpty({ message: "Folder name cannot be empty!" })
  @IsString()
  @MaxLength(255, { message: "Folder name cannot be greater than $constraint1 characters!" })
  name!: string;

  @IsOptional()
  @IsString()
  parent!: string;
}
