import { IsNotEmpty, IsString } from "class-validator";

import { User } from "@/modules/users/schemas/user.schema";

export class DeleteAccountDto {
  @IsNotEmpty({ message: "Old password cannot be empty!" })
  @IsString()
  password!: User["password"];
}
