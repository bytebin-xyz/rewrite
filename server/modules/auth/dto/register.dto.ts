import { IsAlphanumeric, IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

import { User } from "~/server/modules/users/interfaces/user.interface";

export class RegisterDto {
  @IsEmail({}, { message: "You must enter a valid email!" })
  @IsNotEmpty({ message: "Email cannot be empty!" })
  @IsString()
  email!: User["email"];

  @MinLength(8, {
    message: "Your password must be at least 8 characters long!"
  })
  @IsNotEmpty({ message: "Password cannot be empty!" })
  @IsString()
  password!: string;

  @IsNotEmpty()
  @IsString()
  recaptcha!: string;

  @IsAlphanumeric("en-US", { message: "Usernames must be alphanumeric!" })
  @IsNotEmpty({ message: "Username cannot be empty!" })
  @IsString()
  username!: User["username"];
}
