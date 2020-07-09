import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength
} from "class-validator";

import { User } from "@/modules/users/schemas/user.schema";

export class RegisterDto {
  @IsEmail({}, { message: "You must enter a valid email!" })
  @IsNotEmpty({ message: "Email cannot be empty!" })
  @IsString()
  email!: User["email"];

  @MinLength(8, { message: "Your password must be at least 8 characters long!" })
  @IsNotEmpty({ message: "Password cannot be empty!" })
  @IsString()
  password!: User["password"];

  @IsNotEmpty()
  @IsString()
  recaptcha!: string;

  @IsAlphanumeric(undefined, { message: "Usernames must be alphanumeric!" })
  @IsNotEmpty({ message: "Username cannot be empty!" })
  @IsString()
  @MaxLength(32, { message: "Usernames cannot be longer than 32 characters!" })
  username!: User["username"];
}
