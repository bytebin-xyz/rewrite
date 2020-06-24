import { CustomDecorator, SetMetadata } from "@nestjs/common";

export const RecaptchaAction = (action: string): CustomDecorator<string> =>
  SetMetadata("recaptcha-action", action);
