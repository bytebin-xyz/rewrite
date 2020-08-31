import { BullModule } from "@nestjs/bull";
import { ConfigService } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { FilesController } from "./files.controller";
import { FilesProcessor } from "./files.processor";
import { FilesService } from "./files.service";

import { Entry, EntrySchema } from "./schemas/entry.schema";

import { StorageModule } from "@/modules/storage/storage.module";

@Module({
  imports: [
    BullModule.registerQueueAsync({
      inject: [ConfigService],
      name: "files",
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get("REDIS_HOST"),
          port: config.get("REDIS_PORT")
        }
      })
    }),

    MongooseModule.forFeature([{ name: Entry.name, schema: EntrySchema }]),

    StorageModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        engine: {
          disk: {
            directory: config.get("UPLOADS_DIRECTORY") as string
          }
        }
      })
    })
  ],
  exports: [BullModule, FilesService],
  controllers: [FilesController],
  providers: [FilesProcessor, FilesService]
})
export class FilesModule {}
