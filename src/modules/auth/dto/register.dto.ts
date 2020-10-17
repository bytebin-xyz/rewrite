import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength
} from "class-validator";

export class RegisterDto {
  @IsEmail({}, { message: "You must enter a valid email!" })
  @IsNotEmpty({ message: "Email cannot be empty!" })
  @IsString()
  email!: string;

  @MinLength(8, {
    message: "Your password must be at least $constraint1 characters long!"
  })
  @IsNotEmpty({ message: "Password cannot be empty!" })
  @IsString()
  password!: string;

  @IsNotEmpty()
  @IsString()
  recaptcha!: string;

  @IsAlphanumeric(undefined, { message: "Usernames must be alphanumeric!" })
  @IsNotEmpty({ message: "Username cannot be empty!" })
  @IsString()
  @MaxLength(32, {
    message: "Usernames cannot be longer than $constraint1 characters!"
  })
  username!: string;
}
