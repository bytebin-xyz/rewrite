import { IsEmail, IsNotEmpty, IsString } from "class-validator";

import { User } from "@/modules/users/schemas/user.schema";

export class ForgotPasswordDto {
  @IsEmail({}, { message: "You must enter a valid email!" })
  @IsNotEmpty({ message: "Email cannot be empty!" })
  @IsString()
  email!: User["email"];
}
