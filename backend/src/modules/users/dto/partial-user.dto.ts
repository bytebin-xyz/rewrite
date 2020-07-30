import { Exclude } from "class-transformer";

import { UserDto } from "./user.dto";

export class PartialUserDto extends UserDto {
  @Exclude()
  email!: string;
}
