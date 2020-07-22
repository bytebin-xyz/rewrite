import { Module } from "@nestjs/common";

import { ExplorerController } from "./explorer.controller";

@Module({
  controllers: [ExplorerController]
})
export class ExplorerModule {}
