import { HttpModule, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerModule } from "nestjs-throttler";

import { UsersModule } from "../users/users.module";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

import { AuthGuard } from "./guards/auth.guard";

import { PasswordResetSchema } from "~server/modules/nodemailer/schemas/password-reset.schema";

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: "PasswordReset", schema: PasswordResetSchema }]),
    ThrottlerModule.forRoot({}),
    UsersModule
  ],
  exports: [AuthGuard],
  controllers: [AuthController],
  providers: [AuthGuard, AuthService]
})
export class AuthModule {}
