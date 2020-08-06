import { CustomDecorator, SetMetadata } from "@nestjs/common";

export const OptionalAuth = (optional = true): CustomDecorator<string> =>
  SetMetadata("AUTH_OPTIONAL", optional);
