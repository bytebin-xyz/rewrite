import { ConfigService } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

import { EmailConfirmation, EmailConfirmationSchema } from "./schemas/email-confirmation.schema";
import { User, UserSchema } from "./schemas/user.schema";

import { AuthModule } from "@/modules/auth/auth.module";
import { FilesModule } from "@/modules/files/files.module";
import { FoldersModule } from "@/modules/folders/folders.module";
import { SessionsModule } from "@/modules/sessions/sessions.module";
import { StorageModule } from "@/modules/storage/storage.module";

@Module({
  imports: [
    AuthModule,

    FilesModule,

    FoldersModule,

    MongooseModule.forFeature([
      { name: EmailConfirmation.name, schema: EmailConfirmationSchema },
      { name: User.name, schema: UserSchema }
    ]),

    SessionsModule,

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
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
