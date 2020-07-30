import { Module } from "@nestjs/common";

import { BullBoardProvider } from "./bull-board.provider";

import { FilesModule } from "@/modules/files/files.module";

@Module({
  imports: [FilesModule],
  exports: [],
  providers: [BullBoardProvider]
})
export class BullBoardModule {}
