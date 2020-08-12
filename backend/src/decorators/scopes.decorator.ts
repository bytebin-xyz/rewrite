import { CustomDecorator, SetMetadata } from "@nestjs/common";

import { ApplicationScopes } from "@/modules/applications/enums/application-scopes.enum";

import { AUTH_GUARD_SCOPES } from "@/guards/auth.guard";

export const UseScopes = (...scopes: ApplicationScopes[]): CustomDecorator<string> =>
  SetMetadata(AUTH_GUARD_SCOPES, scopes);
