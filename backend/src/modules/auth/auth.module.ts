import { HttpModule, Module } from "@nestjs/common";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

import { UsersModule } from "@/modules/users/users.module";

@Module({
  imports: [HttpModule, UsersModule],
  exports: [AuthService],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
