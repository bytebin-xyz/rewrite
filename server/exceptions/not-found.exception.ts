import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  LoggerService,
  NotFoundException,
  Injectable
} from "@nestjs/common";

// @ts-ignore
import { Nuxt } from "nuxt";

import { Request, Response } from "express";

@Injectable()
@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService, private readonly nuxt: Nuxt) {}

  async catch(_exception: HttpException, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    if (!res.headersSent) {
      try {
        await this.nuxt.render(req, res);
      } catch (error) {
        this.logger.error(error.message, error.stack, "NuxtRenderer");
        throw error;
      }
    }
  }
}
