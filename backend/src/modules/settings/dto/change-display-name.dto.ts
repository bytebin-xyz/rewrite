import { IsAlphanumeric, IsNotEmpty, IsString, MaxLength } from "class-validator";

import { User } from "@/modules/users/schemas/user.schema";

export class ChangeDisplayNameDto {
  @IsAlphanumeric(undefined, { message: "Display names must be alphanumeric!" })
  @IsNotEmpty({ message: "New display name cannot be empty!" })
  @IsString()
  @MaxLength(32, { message: "Display names cannot be longer than 32 characters!" })
  newDisplayName!: User["displayName"];
}
