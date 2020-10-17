import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { FilesController } from "./files.controller";
import { FilesProcessor } from "./files.processor";
import { FilesService } from "./files.service";

import { File, FileSchema } from "./schemas/file.schema";

import { config } from "@/config";

import { StorageModule } from "@/modules/storage/storage.module";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "files",
      redis: {
        host: config.get("redis").hostname,
        port: config.get("redis").port
      }
    }),

    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),

    StorageModule.register({
      engine: {
        disk: {
          directory: config.get("uploadsDirectory")
        }
      }
    })
  ],
  exports: [BullModule, FilesService],
  controllers: [FilesController],
  providers: [FilesProcessor, FilesService]
})
export class FilesModule {}
