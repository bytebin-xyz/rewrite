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

import { InsufficientScopes, InvalidAPIKey } from "@/modules/applications/applications.errors";
import { UserNotActivated, UserNotLoggedIn } from "@/modules/auth/auth.errors";

import { ApplicationScopes } from "@/modules/applications/enums/application-scopes.enum";

import { ApplicationsService } from "@/modules/applications/applications.service";
import { UsersService } from "@/modules/users/users.service";

import { atob } from "@/utils/atob";

export const AUTH_GUARD_OPTIONAL = "AUTH_GUARD_OPTIONAL";
export const AUTH_GUARD_SCOPES = "AUTH_GUARD_SCOPES";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly applications: ApplicationsService,
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
    private readonly users: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const optional = this._getMetadata<boolean>(AUTH_GUARD_OPTIONAL, context);
    const scopes = this._getMetadata<ApplicationScopes[]>(AUTH_GUARD_SCOPES, context);

    const req = context.switchToHttp().getRequest<IRequest>();

    try {
      return req.headers.authorization
        ? await this._handleAPIKey(req, scopes)
        : await this._handleSession(req);
    } catch (error) {
      if (!optional) throw error;
      return true;
    }
  }

  private async _handleAPIKey(req: IRequest, scopes?: ApplicationScopes[]) {
    const key = req.headers.authorization && atob(req.headers.authorization);
    if (!key) throw new InvalidAPIKey();

    const [id, token] = key.split(".");
    if (!id || !token) throw new InvalidAPIKey();

    const application = await this.applications.findOne({ id });

    if (!application || !application.compareKey(key, this.config.get("API_SECRET") as string)) {
      throw new InvalidAPIKey();
    }

    // Only allow routes that specify scopes to allow the usage of an API key.
    if (!scopes || !scopes.length || !application.hasSufficientScopes(scopes)) {
      throw new InsufficientScopes();
    }

    const user = await this.users.findOne({ id: application.uid });
    if (!user) throw new InvalidAPIKey();

    await application.updateOne({ lastUsed: new Date() });

    req.user = user;

    return true;
  }

  private async _handleSession(req: IRequest) {
    if (!req.session) {
      throw new InternalServerErrorException(
        `Failed to get session data! req.session was: ${req.session}`
      );
    }

    const user = req.session.uid ? await this.users.findOne({ id: req.session.uid }) : null;

    if (!user) throw new UserNotLoggedIn();
    if (!user.activated) throw new UserNotActivated();

    req.session.ip = getClientIp(req);
    req.session.lastUsed = new Date();
    req.user = user;

    return true;
  }

  private _getMetadata<T>(key: string, context: ExecutionContext): T | undefined {
    return this.reflector.get<T | undefined>(key, context.getHandler());
  }
}
