import { Module } from "@nestjs/common";

import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";

@Module({
  exports: [SettingsService],
  controllers: [SettingsController],
  providers: [SettingsService]
})
export class SettingsModule {}
