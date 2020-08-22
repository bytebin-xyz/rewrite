import { BullModule } from "@nestjs/bull";
import { ConfigService } from "@nestjs/config";
import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { FilesController } from "./files.controller";
import { FilesProcessor } from "./files.processor";
import { FilesService } from "./files.service";

import { File, FileSchema } from "./schemas/file.schema";

import { FoldersModule } from "@/modules/folders/folders.module";
import { StorageModule } from "@/modules/storage/storage.module";

@Module({
  imports: [
    forwardRef(() => FoldersModule),

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

    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),

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
