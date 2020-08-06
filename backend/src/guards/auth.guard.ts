import { getClientIp } from "request-ip";

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException
} from "@nestjs/common";

import { Reflector } from "@nestjs/core";

import { IRequest } from "@/interfaces/request.interface";

import { UserNotActivated, UserNotLoggedIn } from "@/modules/auth/auth.errors";

import { UsersService } from "@/modules/users/users.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly users: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isOptional = this.reflector.get<boolean | undefined>(
      "AUTH_OPTIONAL",
      context.getHandler()
    );

    const shouldThrow = (error: Error) => {
      if (!isOptional) throw error;
      return true;
    };

    const req = context.switchToHttp().getRequest<IRequest>();

    if (!req.session) {
      return shouldThrow(new InternalServerErrorException("Failed to get session data!"));
    }

    const user = req.session.uid ? await this.users.findOne({ id: req.session.uid }) : null;

    if (!user) return shouldThrow(new UserNotLoggedIn());
    if (!user.activated) return shouldThrow(new UserNotActivated());

    req.session.ip = getClientIp(req);
    req.session.lastUsed = new Date();
    req.user = user;

    return true;
  }
}
