import { HttpModule, Module } from "@nestjs/common";
import { ThrottlerModule } from "nestjs-throttler";

import { UsersModule } from "../users/users.module";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

import { AuthGuard } from "./guards/auth.guard";

@Module({
  imports: [HttpModule, ThrottlerModule.forRoot({}), UsersModule],
  exports: [AuthGuard, AuthService],
  controllers: [AuthController],
  providers: [AuthGuard, AuthService]
})
export class AuthModule {}
