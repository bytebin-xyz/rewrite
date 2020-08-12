import { HttpModule, Module } from "@nestjs/common";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

import { SessionsModule } from "@/modules/sessions/sessions.module";

@Module({
  imports: [HttpModule, SessionsModule],
  exports: [AuthService],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
