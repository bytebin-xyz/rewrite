import qs from "qs";
import requestIP from "request-ip";

import {
  BadGatewayException,
  BadRequestException,
  CanActivate,
  ExecutionContext,
  HttpService,
  Injectable,
  InternalServerErrorException,
  Logger
} from "@nestjs/common";

import { ConfigService } from "@nestjs/config";

import { Reflector } from "@nestjs/core";

import { Request } from "express";

const API_URL = "https://www.google.com/recaptcha/api/siteverify";

@Injectable()
export class RecaptchaGuard implements CanActivate {
  private readonly logger = new Logger("RecaptchaGuard");

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const action = this._getMetadata<string>("recaptcha-action", context);
    const score = this._getMetadata<number>("recaptcha-score", context);

    const req = context.switchToHttp().getRequest<Request>();

    const { recaptcha } = req.body;

    if (!recaptcha) {
      throw new BadRequestException("Please complete the reCAPTCHA!");
    }

    const result = await this.http
      .post(
        API_URL,
        qs.stringify({
          remoteip: requestIP.getClientIp(req),
          response: recaptcha,
          secret: this.config.get("RECAPTCHA_SECRET")
        })
      )
      .toPromise()
      .then((res) => {
        const body = res.data;
        const errorCodes = body["error-codes"];
        const filterFn = (errorMessage: string) => errorMessage.endsWith("secret");

        if (!errorCodes || !errorCodes.length || !errorCodes.some(filterFn)) {
          return body;
        }

        return { error: errorCodes.filter(filterFn).join(", ") };
      })
      .catch((error) => ({ error }));

    if (result.error) {
      this.logger.error(result.error);

      throw new BadGatewayException(
        "Failed to verify your reCAPTCHA response! Please try again later."
      );
    }

    if (
      !result.success ||
      (result.action && result.action !== action) ||
      (result.score && result.score < score)
    ) {
      throw new BadRequestException("reCAPTCHA failed, please try again!");
    }

    return true;
  }

  private _getMetadata<T>(key: string, context: ExecutionContext) {
    const handler = context.getHandler();
    const metadata = this.reflector.get<T>(key, handler);

    if (!metadata) {
      throw new InternalServerErrorException(
        `${key} not provided for ${handler.name} in ${context.getClass().name}`
      );
    }

    return metadata;
  }
}
