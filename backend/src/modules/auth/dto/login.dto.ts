import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @IsNotEmpty({ message: "Password cannot be empty!" })
  @IsString()
  password!: string;

  @IsNotEmpty()
  @IsString()
  recaptcha!: string;

  @IsNotEmpty({ message: "Username cannot be empty!" })
  @IsString()
  username!: string;
}
