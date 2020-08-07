import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateApplicationDto {
  @IsNotEmpty({ message: "Application name cannot be empty!" })
  @IsString()
  @MaxLength(32, { message: "Application name cannot be greater than $constraint1 characters!" })
  name!: string;
}
