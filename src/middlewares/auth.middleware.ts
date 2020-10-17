import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
  UnauthorizedException
} from "@nestjs/common";

import { NextFunction, Response } from "express";

import { Request } from "@/interfaces/request.interface";

import { UsersService } from "@/modules/users/users.service";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly users: UsersService) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const user = req.session.uid
      ? await this.users.findOne({ id: req.session.uid })
      : null;

    if (!user) {
      throw new UnauthorizedException("You are not logged in!");
    }

    if (!user.activated) {
      throw new ForbiddenException("Please activate your account first!");
    }

    req.user = user;

    next();
  }
}
