import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { FoldersController } from "./folders.controller";
import { FoldersService } from "./folders.service";

import { Folder, FolderSchema } from "./schemas/folder.schema";

import { FilesModule } from "@/modules/files/files.module";

@Module({
  imports: [
    forwardRef(() => FilesModule),

    MongooseModule.forFeature([{ name: Folder.name, schema: FolderSchema }])
  ],
  exports: [FoldersService],
  controllers: [FoldersController],
  providers: [FoldersService]
})
export class FoldersModule {}
