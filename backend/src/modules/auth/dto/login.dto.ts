import { IsNotEmpty, IsString } from "class-validator";

import { User } from "@/modules/users/schemas/user.schema";

export class LoginDto {
  @IsNotEmpty({ message: "Password cannot be empty!" })
  @IsString()
  password!: User["password"];

  @IsNotEmpty()
  @IsString()
  recaptcha!: string;

  @IsNotEmpty({ message: "Username cannot be empty!" })
  @IsString()
  username!: User["username"];
}
