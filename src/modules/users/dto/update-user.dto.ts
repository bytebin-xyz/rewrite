import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from "class-validator";

export class UpdateUserDto {
  @IsAlphanumeric(undefined, { message: "Display names must be alphanumeric!" })
  @IsNotEmpty({ message: "New display name cannot be empty!" })
  @IsOptional()
  @IsString()
  @MaxLength(32, {
    message: "Display names cannot be longer than $constraint1 characters!"
  })
  displayName!: string;

  @IsEmail({}, { message: "You must enter a valid email!" })
  @IsNotEmpty({ message: "Email cannot be empty!" })
  @IsOptional()
  @IsString()
  email!: string;

  @IsNotEmpty({ message: "New password cannot be empty!" })
  @IsOptional()
  @IsString()
  @MinLength(8, {
    message: "Your password must be at least $constraint1 characters long!"
  })
  newPassword?: string;

  @IsNotEmpty({ message: "Password cannot be empty!" })
  @IsString()
  password!: string;
}
