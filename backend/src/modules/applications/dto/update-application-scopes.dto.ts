import { ArrayUnique, IsEnum } from "class-validator";

import { ApplicationScopes } from "../enums/application-scopes.enum";

export class UpdateApplicationScopesDto {
  @ArrayUnique({ message: "Application scope elements must be unique!" })
  @IsEnum(ApplicationScopes, { each: true, message: "Invalid application scopes provided!" })
  scopes!: ApplicationScopes[];
}
