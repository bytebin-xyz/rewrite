import { HttpModule, Module } from "@nestjs/common";
import { ThrottlerModule } from "nestjs-throttler";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

import { AuthGuard } from "./guards/auth.guard";

import { UsersModule } from "@/modules/users/users.module";

@Module({
  imports: [HttpModule, ThrottlerModule.forRoot({}), UsersModule],
  exports: [AuthGuard, AuthService],
  controllers: [AuthController],
  providers: [AuthGuard, AuthService]
})
export class AuthModule {}
