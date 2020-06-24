import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";

import { EmailConfirmationSchema } from "./schemas/email-confirmation.schema";

import { UsersModule } from "~server/modules/users/users.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "EmailConfirmation", schema: EmailConfirmationSchema }]),
    UsersModule
  ],
  exports: [SettingsService],
  controllers: [SettingsController],
  providers: [SettingsService]
})
export class SettingsModule {}
