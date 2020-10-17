import { ApiExcludeEndpoint } from "@nestjs/swagger";
import { Controller, Delete, Get, Param, Req, UseGuards } from "@nestjs/common";

import { plainToClass } from "class-transformer";

import { SessionsService } from "./sessions.service";

import { CurrentUser } from "@/decorators/current-user.decorator";

import { SessionDto } from "@/dto/session.dto";

import { AuthGuard } from "@/guards/auth.guard";

import { Request } from "@/interfaces/request.interface";

@Controller("sessions")
@UseGuards(AuthGuard)
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @ApiExcludeEndpoint()
  @Get()
  async getAll(
    @CurrentUser("id") uid: string,
    @Req() req: Request
  ): Promise<SessionDto[]> {
    const sessions = await this.sessions.find({ "session.uid": uid });

    return sessions.map(({ session }) =>
      plainToClass(SessionDto, {
        ...session,
        isCurrent: session.id === req.session.id
      })
    );
  }

  @ApiExcludeEndpoint()
  @Delete()
  revokeAll(
    @CurrentUser("id") uid: string,
    @Req() req: Request
  ): Promise<void> {
    return this.sessions.deleteMany({
      id: { $ne: req.session.id },
      "session.uid": uid
    });
  }

  @ApiExcludeEndpoint()
  @Delete(":id/revoke")
  revoke(
    @CurrentUser("id") uid: string,
    @Param("id") id: string
  ): Promise<void> {
    return this.sessions.deleteOne({ id, "session.uid": uid });
  }
}
