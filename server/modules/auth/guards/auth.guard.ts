import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

import { IRequest } from "~server/interfaces/request.interface";

import { UsersService } from "~server/modules/users/users.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly users: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<IRequest>();

    if (!req.session || !req.session.uid) {
      throw new UnauthorizedException("You are not logged in!");
    }

    const user = await this.users.findOne({ uid: req.session.uid });

    if (!user || user.deleted) {
      req.session.destroy(() => {});
      throw new UnauthorizedException("You are not logged in!");
    }

    req.session.lastUsed = new Date();
    req.user = user;

    return true;
  }
}
