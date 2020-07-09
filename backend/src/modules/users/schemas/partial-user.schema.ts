import { Exclude } from "class-transformer";

import { User } from "./user.schema";

export class PartialUser extends User {
  @Exclude()
  activated!: User["activated"];

  @Exclude()
  deleted!: User["deleted"];

  @Exclude()
  email!: User["email"];

  @Exclude()
  expiresAt!: User["expiresAt"];

  @Exclude()
  password!: User["password"];

  @Exclude()
  updatedAt!: User["updatedAt"];
}
