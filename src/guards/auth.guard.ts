import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

import { Reflector } from "@nestjs/core";

import { config } from "@/config";

import { Request } from "@/interfaces/request.interface";

import {
  InsufficientScopes,
  InvalidApplicationKey
} from "@/modules/applications/applications.errors";

import { ApplicationsService } from "@/modules/applications/applications.service";

import { ApplicationScopes } from "@/modules/applications/enums/application-scopes.enum";

import { UserNotActivated, UserNotLoggedIn } from "@/modules/auth/auth.errors";

import { UsersService } from "@/modules/users/users.service";

import { atob } from "@/utils/atob";

export const AUTH_GUARD_OPTIONAL = "AUTH_GUARD_OPTIONAL";
export const AUTH_GUARD_SCOPES = "AUTH_GUARD_SCOPES";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly applications: ApplicationsService,
    private readonly reflector: Reflector,
    private readonly users: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const optional = this._getMetadata<boolean>(AUTH_GUARD_OPTIONAL, context);
    const scopes = this._getMetadata<ApplicationScopes[]>(
      AUTH_GUARD_SCOPES,
      context
    );

    const req = context.switchToHttp().getRequest<Request>();

    try {
      return req.headers.authorization
        ? await this._handleAPIKey(req, scopes)
        : await this._handleSession(req);
    } catch (error) {
      if (!optional) throw error;
      return true;
    }
  }

  private async _handleAPIKey(req: Request, scopes?: ApplicationScopes[]) {
    const key = req.headers.authorization && atob(req.headers.authorization);
    if (!key) throw new InvalidApplicationKey();

    const [id, token] = key.split(".");
    if (!id || !token) throw new InvalidApplicationKey();

    const application = await this.applications.findOne({ id });

    if (!application?.compareKey(key, config.get("secrets").applications)) {
      throw new InvalidApplicationKey();
    }

    // Only allow routes that has UseScopes() to allow the usage of an application key
    if (!scopes || !application.hasSufficientScopes(scopes)) {
      throw new InsufficientScopes();
    }

    const user = await this.users.findOne({ id: application.uid });
    if (!user) throw new InvalidApplicationKey();

    await application.updateOne({ lastUsed: new Date() });

    req.user = user;

    return true;
  }

  private async _handleSession(req: Request) {
    const user = req.session.uid
      ? await this.users.findOne({ id: req.session.uid })
      : null;

    if (!user) throw new UserNotLoggedIn();
    if (!user.activated) throw new UserNotActivated();

    req.user = user;

    return true;
  }

  private _getMetadata<T>(
    key: string,
    context: ExecutionContext
  ): T | undefined {
    return this.reflector.get<T | undefined>(key, context.getHandler());
  }
}
