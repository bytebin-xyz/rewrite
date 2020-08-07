import { IsNotEmpty, IsString } from "class-validator";

export class DeleteAccountDto {
  @IsNotEmpty({ message: "Old password cannot be empty!" })
  @IsString()
  password!: string;
}
