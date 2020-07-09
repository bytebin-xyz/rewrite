import { IsNotEmpty, IsString, MinLength } from "class-validator";

import { PasswordReset } from "@/modules/nodemailer/schemas/password-reset.schema";
import { User } from "@/modules/users/schemas/user.schema";

export class ResetPasswordDto {
  @IsNotEmpty({ message: "New password cannot be empty!" })
  @IsString()
  @MinLength(8, {
    message: "Your password must be at least 8 characters long!"
  })
  newPassword!: User["password"];

  @IsNotEmpty({ message: "Password reset token cannot be missing!" })
  @IsString()
  token!: PasswordReset["token"];
}
