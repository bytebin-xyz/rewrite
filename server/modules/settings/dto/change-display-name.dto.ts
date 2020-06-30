import { IsNotEmpty, IsString } from "class-validator";

export class ChangeDisplayNameDto {
  @IsNotEmpty({ message: "New display name cannot be empty!" })
  @IsString()
  newDisplayName!: string;
}
