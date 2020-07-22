import { ConfigModule, ConfigService } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MulterModule } from "@nestjs/platform-express";

import { FilesController } from "./files.controlller";
import { FilesService } from "./files.service";

import { File, FileSchema } from "./schemas/file.schema";

import { UsersModule } from "@/modules/users/users.module";

import { DiskStorage } from "@/storage/disk.storage";

import { generateId } from "@/utils/generateId";

@Module({
  imports: [
    UsersModule,

    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),

    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        limits: {
          files: config.get("multer.max_files"),
          fileSize: config.get("multer.max_file_size")
        },
        storage: new DiskStorage({
          directory: config.get("UPLOAD_DIRECTORY") as string,
          filename: (): Promise<string> => generateId(8)
        })
      })
    })
  ],
  controllers: [FilesController],
  providers: [FilesService]
})
export class FilesModule {}
