import * as path from "path";

import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Controller, Get, UseGuards } from "@nestjs/common";

import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
  MemoryHealthIndicator,
  MongooseHealthIndicator
} from "@nestjs/terminus";

import { UseScopes } from "@/decorators/use-scopes.decorator";

import { AuthGuard } from "@/guards/auth.guard";

@ApiSecurity("api_key")
@ApiTags("Health")
@Controller("health")
@UseGuards(AuthGuard)
export class HealthController {
  constructor(
    private readonly db: MongooseHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  @UseScopes()
  readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      (): Promise<HealthIndicatorResult> =>
        this.db.pingCheck("database", { timeout: 2000 }),

      (): Promise<HealthIndicatorResult> =>
        this.disk.checkStorage("disk", {
          path: path.parse(__dirname).root,
          thresholdPercent: 0.9
        }),

      (): Promise<HealthIndicatorResult> =>
        this.memory.checkRSS("memory", 200 * 1024 * 1024)
    ]);
  }
}
