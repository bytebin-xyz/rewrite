import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  NotFoundException
} from "@nestjs/common";

// @ts-ignore
import { Nuxt } from "nuxt";

import { Request, Response } from "express";

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  constructor(private readonly nuxt: Nuxt) {}

  async catch(_exception: HttpException, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    if (!res.headersSent) await this.nuxt.render(req, res);
  }
}
