import { Module } from "@nestjs/common";

import { MeController } from "./me.controller";
import { MeService } from "./me.service";

import { UsersModule } from "~server/modules/users/users.module";

@Module({
  imports: [UsersModule],
  exports: [MeService],
  controllers: [MeController],
  providers: [MeService]
})
export class MeModule {}
