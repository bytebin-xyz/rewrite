import { Injectable, UnauthorizedException } from "@nestjs/common";

import { NextFunction, Response } from "express";

import { AuthMiddleware } from "./auth.middleware";

import { IRequest } from "@/interfaces/request.interface";

@Injectable()
export class AdminMiddleware extends AuthMiddleware {
  async use(req: IRequest, res: Response, next: NextFunction): Promise<void> {
    await super.use(req, res, (error?: any) => {
      if (!req.user?.admin) {
        throw new UnauthorizedException("You are not an admin!");
      }

      next(error);
    });
  }
}
