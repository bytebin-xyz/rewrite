import { IsNotEmpty, IsString, MinLength } from "class-validator";

import { User } from "@/modules/users/schemas/user.schema";

export class ChangePasswordDto {
  @IsNotEmpty({ message: "New password cannot be empty!" })
  @IsString()
  @MinLength(8, {
    message: "Your password must be at least 8 characters long!"
  })
  newPassword!: User["password"];

  @IsNotEmpty({ message: "Old password cannot be empty!" })
  @IsString()
  oldPassword!: User["password"];
}
