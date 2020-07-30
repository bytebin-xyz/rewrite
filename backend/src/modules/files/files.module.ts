import { BullModule } from "@nestjs/bull";
import { ConfigService } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MulterModule } from "@nestjs/platform-express";

import { Request } from "express";

import { FilesController } from "./files.controlller";
import { FilesProcessor } from "./files.processor";
import { FilesService } from "./files.service";

import { File, FileSchema } from "./schemas/file.schema";
import { UploadSession, UploadSessionSchema } from "./schemas/upload-session.schema";

import { UsersModule } from "@/modules/users/users.module";

import { DiskStorage, IncomingFile } from "@/storage/disk.storage";

import { generateId } from "@/utils/generateId";
import { pathFromString } from "@/utils/pathFromString";

@Module({
  imports: [
    UsersModule,

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

    MongooseModule.forFeature([
      { name: File.name, schema: FileSchema },
      { name: UploadSession.name, schema: UploadSessionSchema }
    ]),

    MulterModule.registerAsync({
      imports: [FilesModule],
      inject: [ConfigService, FilesService],
      useFactory: (config: ConfigService, files: FilesService) => ({
        limits: {
          files: config.get("MAX_FILES_PER_UPLOAD"),
          fileSize: config.get("MAX_FILE_SIZE")
        },
        storage: new DiskStorage({
          directory: (_req: Request, _file: IncomingFile, filename: string): string =>
            files.getFullPath(pathFromString(filename)),
          filename: (): Promise<string> => generateId(8)
        })
      })
    })
  ],
  exports: [BullModule, FilesService],
  controllers: [FilesController],
  providers: [FilesProcessor, FilesService]
})
export class FilesModule {}
