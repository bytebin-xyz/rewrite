import { Module } from "@nestjs/common";

import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";

import { AuthModule } from "@/modules/auth/auth.module";
import { FilesModule } from "@/modules/files/files.module";
import { UsersModule } from "@/modules/users/users.module";

@Module({
  imports: [AuthModule, FilesModule, UsersModule],
  exports: [SettingsService],
  controllers: [SettingsController],
  providers: [SettingsService]
})
export class SettingsModule {}
