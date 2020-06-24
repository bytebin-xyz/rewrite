import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ForgotPasswordDto {
  @IsEmail({}, { message: "You must enter a valid email!" })
  @IsNotEmpty({ message: "Email cannot be empty!" })
  @IsString()
  email!: string;
}
