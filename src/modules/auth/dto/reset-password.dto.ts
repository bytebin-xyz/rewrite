import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
  @IsNotEmpty({ message: "New password cannot be empty!" })
  @IsString()
  @MinLength(8, {
    message: "Your password must be at least $constraint1 characters long!"
  })
  newPassword!: string;

  @IsNotEmpty({ message: "Password reset token cannot be missing!" })
  @IsString()
  token!: string;
}
