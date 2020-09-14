import { IsNotEmpty, IsString } from "class-validator";

export class DeleteUserDto {
  @IsNotEmpty({ message: "Password cannot be empty!" })
  @IsString()
  password!: string;
}
