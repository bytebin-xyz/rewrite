import { BullModule } from "@nestjs/bull";
import { ConfigService } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { FilesController } from "./files.controller";
import { FilesProcessor } from "./files.processor";
import { FilesService } from "./files.service";

import { File, FileSchema } from "./schemas/file.schema";

import { StorageModule } from "@/modules/storage/storage.module";
import { UsersModule } from "@/modules/users/users.module";

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
    }),

    UsersModule
  ],
  exports: [BullModule, FilesService],
  controllers: [FilesController],
  providers: [FilesProcessor, FilesService]
})
export class FilesModule {}
