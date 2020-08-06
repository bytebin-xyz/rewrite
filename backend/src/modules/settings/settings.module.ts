import { ConfigService } from "@nestjs/config";
import { Module } from "@nestjs/common";

import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";

import { AuthModule } from "@/modules/auth/auth.module";
import { FilesModule } from "@/modules/files/files.module";
import { StorageModule } from "@/modules/storage/storage.module";
import { UsersModule } from "@/modules/users/users.module";

@Module({
  imports: [
    AuthModule,
    FilesModule,
    UsersModule,

    StorageModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        engine: {
          disk: {
            directory: config.get("UPLOADS_DIRECTORY") as string
          }
        }
      })
    })
  ],
  exports: [SettingsService],
  controllers: [SettingsController],
  providers: [SettingsService]
})
export class SettingsModule {}
