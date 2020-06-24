import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";

import { Request } from "express";

import { ISession } from "~/server/interfaces/session.interface";

import { UsersService } from "~server/modules/users/users.service";
import { User } from "~server/modules/users/interfaces/user.interface";

export interface IRequest extends Request {
  session?: ISession;
  user?: User;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly users: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<IRequest>();

    if (!req.session || !req.session.uid) {
      throw new UnauthorizedException("You are not logged in!");
    }

    const user = await this.users.findOne({ uid: req.session.uid });
    if (!user) throw new UnauthorizedException("You are not logged in!");

    req.user = user;

    return true;
  }
}
