import { HttpModule, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

import { SessionsModule } from "@/modules/sessions/sessions.module";

import { PasswordReset, PasswordResetSchema } from "./schemas/password-reset.schema";
import { UserActivation, UserActivationSchema } from "./schemas/user-activation.schema";

@Module({
  imports: [
    HttpModule,

    MongooseModule.forFeature([
      { name: PasswordReset.name, schema: PasswordResetSchema },
      { name: UserActivation.name, schema: UserActivationSchema }
    ]),

    SessionsModule
  ],
  exports: [AuthService],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
