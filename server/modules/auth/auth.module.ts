import { HttpModule, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerModule } from "nestjs-throttler";

import { UsersModule } from "../users/users.module";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

import { AuthGuard } from "./guards/auth.guard";

import { PasswordResetSchema } from "./schemas/password-reset.schema";
import { UserActivationSchema } from "./schemas/user-activation.schema";

@Module({
  imports: [
    HttpModule,

    MongooseModule.forFeature([
      { name: "PasswordReset", schema: PasswordResetSchema },
      { name: "UserActivation", schema: UserActivationSchema }
    ]),

    ThrottlerModule.forRoot({}),

    UsersModule
  ],
  exports: [AuthGuard],
  controllers: [AuthController],
  providers: [AuthGuard, AuthService]
})
export class AuthModule {}
