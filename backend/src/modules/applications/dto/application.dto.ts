import { Exclude } from "class-transformer";

import { ApplicationScopes } from "@/modules/applications/enums/application-scopes.enum";

export class ApplicationDto {
  createdAt!: Date;

  id!: string;

  @Exclude()
  key!: string | null;

  lastUsed!: Date | null;

  name!: string;

  scopes!: ApplicationScopes[];

  @Exclude()
  updatedAt!: Date;
}
