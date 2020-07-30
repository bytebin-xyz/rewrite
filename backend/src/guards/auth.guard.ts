import { getClientIp } from "request-ip";

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException
} from "@nestjs/common";

import { IRequest } from "@/interfaces/request.interface";

import { UserNotActivated, UserNotLoggedIn } from "@/modules/auth/auth.errors";

import { UsersService } from "@/modules/users/users.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly users: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<IRequest>();
    if (!req.session) throw new InternalServerErrorException("Failed to get session data!");

    const user = req.session.uid ? await this.users.findOne({ id: req.session.uid }) : null;

    if (!user) throw new UserNotLoggedIn();
    if (!user.activated) throw new UserNotActivated();

    req.session.ip = getClientIp(req);
    req.session.lastUsed = new Date();
    req.user = user;

    return true;
  }
}
