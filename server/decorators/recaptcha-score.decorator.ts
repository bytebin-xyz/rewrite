import { CustomDecorator, SetMetadata } from "@nestjs/common";

export const RecaptchaScore = (score: number): CustomDecorator<string> =>
  SetMetadata("recaptcha-score", score);
