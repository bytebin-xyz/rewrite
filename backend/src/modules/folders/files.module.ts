import { Module } from "@nestjs/common";

import { FilesController } from "./files.controlller";

@Module({
  controllers: [FilesController]
})
export class FilesModule {}
