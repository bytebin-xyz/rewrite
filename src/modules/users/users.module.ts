import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

import {
  EmailConfirmation,
  EmailConfirmationSchema
} from "./schemas/email-confirmation.schema";

import { User, UserSchema } from "./schemas/user.schema";

import { config } from "@/config";

import { AuthModule } from "@/modules/auth/auth.module";
import { FilesModule } from "@/modules/files/files.module";
import { SessionsModule } from "@/modules/sessions/sessions.module";
import { StorageModule } from "@/modules/storage/storage.module";

@Module({
  imports: [
    AuthModule,

    FilesModule,

    MongooseModule.forFeature([
      { name: EmailConfirmation.name, schema: EmailConfirmationSchema },
      { name: User.name, schema: UserSchema }
    ]),

    SessionsModule,

    StorageModule.register({
      engine: {
        disk: {
          directory: config.get("uploadsDirectory")
        }
      }
    })
  ],
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
