import { getClientIp } from "request-ip";

import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NestMiddleware,
  UnauthorizedException
} from "@nestjs/common";

import { NextFunction, Response } from "express";

import { IRequest } from "@/interfaces/request.interface";

import { UsersService } from "@/modules/users/users.service";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly users: UsersService) {}

  async use(req: IRequest, _res: Response, next: NextFunction): Promise<void> {
    if (!req.session) throw new InternalServerErrorException("Failed to get session data!");

    const user = req.session.uid ? await this.users.findOne({ id: req.session.uid }) : null;

    if (!user) throw new UnauthorizedException("You are not logged in!");
    if (!user.activated) throw new ForbiddenException("Please activate your account first!");

    req.session.ip = getClientIp(req);
    req.session.lastUsed = new Date();
    req.user = user;

    next();
  }
}
