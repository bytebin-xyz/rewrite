import path from "path";

import { Controller, Get } from "@nestjs/common";

import { ConfigService } from "@nestjs/config";

import {
  DiskHealthIndicator,
  DNSHealthIndicator,
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
  MemoryHealthIndicator,
  MongooseHealthIndicator
} from "@nestjs/terminus";

@Controller("health")
export class HealthController {
  constructor(
    private readonly config: ConfigService,
    private readonly db: MongooseHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly dns: DNSHealthIndicator,
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      (): Promise<HealthIndicatorResult> => this.db.pingCheck("database", { timeout: 2000 }),

      (): Promise<HealthIndicatorResult> =>
        this.disk.checkStorage("disk", {
          path: path.parse(__dirname).root,
          thresholdPercent: 0.9
        }),

      (): Promise<HealthIndicatorResult> =>
        this.dns.pingCheck("web", `http://${this.config.get("FRONTEND_DOMAIN")}` || ""),

      (): Promise<HealthIndicatorResult> => this.memory.checkRSS("memory", 200 * 1024 * 1024)
    ]);
  }
}
