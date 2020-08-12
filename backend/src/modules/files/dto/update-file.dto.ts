import { IsBoolean, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdateFileDto {
  @IsNotEmpty({ message: "New filename cannot be empty!" })
  @IsString()
  @MaxLength(255, { message: "Filename cannot be greater than $constraint1 characters!" })
  filename!: string;

  @IsBoolean()
  hidden!: boolean;

  @IsBoolean()
  public!: boolean;
}
