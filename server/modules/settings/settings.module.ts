import { Module } from "@nestjs/common";

import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";

import { AuthModule } from "~server/modules/auth/auth.module";
import { UsersModule } from "~server/modules/users/users.module";

@Module({
  imports: [AuthModule, UsersModule],
  exports: [SettingsService],
  controllers: [SettingsController],
  providers: [SettingsService]
})
export class SettingsModule {}
