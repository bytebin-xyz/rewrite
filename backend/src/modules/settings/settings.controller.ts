import { Controller, Get, Param } from "@nestjs/common";

import { Throttle } from "nestjs-throttler";

import { SettingsService } from "./settings.service";

@Controller("settings")
@Throttle(30, 60)
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get("activate-account/:token")
  activateAccount(@Param("token") token: string): Promise<void> {
    return this.settings.activate(token);
  }

  @Get("confirm-email/:token")
  confirmEmail(@Param("token") token: string): Promise<void> {
    return this.settings.confirmEmail(token);
  }
}
