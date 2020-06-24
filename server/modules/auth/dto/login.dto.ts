import { IsNotEmpty, IsString } from "class-validator";

import { User } from "~/server/modules/users/interfaces/user.interface";

export class LoginDto {
  @IsNotEmpty({ message: "Password cannot be empty!" })
  @IsString()
  password!: string;

  @IsNotEmpty()
  @IsString()
  recaptcha!: string;

  @IsNotEmpty({ message: "Username cannot be empty!" })
  @IsString()
  username!: User["username"];
}
