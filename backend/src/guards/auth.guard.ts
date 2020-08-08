import { getClientIp } from "request-ip";

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException
} from "@nestjs/common";

import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";

import { IRequest } from "@/interfaces/request.interface";

import { InvalidAPIKey } from "@/modules/applications/applications.errors";
import { UserNotActivated, UserNotLoggedIn } from "@/modules/auth/auth.errors";

import { ApplicationsService } from "@/modules/applications/applications.service";
import { UsersService } from "@/modules/users/users.service";

export const AUTH_GUARD_OPTIONAL = "AUTH_GUARD_OPTIONAL";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly applications: ApplicationsService,
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
    private readonly users: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isOptional = this.reflector.get<boolean | undefined>(
      AUTH_GUARD_OPTIONAL,
      context.getHandler()
    );

    const req = context.switchToHttp().getRequest<IRequest>();

    try {
      return req.headers.authorization
        ? await this._handleAPIKey(req)
        : await this._handleSession(req);
    } catch (error) {
      if (!isOptional) throw error;
      return true;
    }
  }

  private async _handleAPIKey(req: IRequest) {
    const key = req.headers.authorization;
    if (!key) throw new InvalidAPIKey();

    const [id, token] = key.split(".");
    if (!id || !token) throw new InvalidAPIKey();

    const application = await this.applications.findOne(id);

    if (!application || !application.compareKey(key, this.config.get("API_SECRET") as string)) {
      throw new InvalidAPIKey();
    }

    const user = await this.users.findOne({ id: application.uid });
    if (!user) throw new InvalidAPIKey();

    await application.updateLastUsed();

    req.user = user;

    return true;
  }

  private async _handleSession(req: IRequest) {
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
