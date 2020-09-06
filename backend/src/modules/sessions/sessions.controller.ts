import { plainToClass } from "class-transformer";

import { ApiExcludeEndpoint } from "@nestjs/swagger";
import { Controller, Delete, Get, Param, Session, UseGuards } from "@nestjs/common";

import { SessionsService } from "./sessions.service";

import { SessionDto } from "./dto/session.dto";

import { ISessionData } from "./interfaces/session-data.interface";

import { CurrentUser } from "@/decorators/current-user.decorator";

import { AuthGuard } from "@/guards/auth.guard";

@Controller("sessions")
@UseGuards(AuthGuard)
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @ApiExcludeEndpoint()
  @Get()
  async getSessions(
    @CurrentUser("id") uid: string,
    @Session() currentSession: ISessionData
  ): Promise<SessionDto[]> {
    const sessions = await this.sessions.find({ "session.uid": uid });

    return sessions.map(({ session }) =>
      plainToClass(SessionDto, {
        ...session,
        isCurrent: session.identifier === currentSession.identifier
      })
    );
  }

  @ApiExcludeEndpoint()
  @Delete("/:id/revoke")
  revoke(@CurrentUser("id") uid: string, @Param("id") id: string): Promise<void> {
    return this.sessions.deleteOne({
      "session.identifier": id,
      "session.uid": uid
    });
  }

  @ApiExcludeEndpoint()
  @Delete("all")
  revokeAll(@CurrentUser("id") uid: string, @Session() session: ISessionData): Promise<void> {
    return this.sessions.delete({
      "session.identifier": { $ne: session.identifier },
      "session.uid": uid
    });
  }
}
