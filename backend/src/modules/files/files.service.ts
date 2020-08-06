import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { InjectQueue } from "@nestjs/bull";

import { Model } from "mongoose";
import { Queue } from "bull";

import { FileNotFound } from "./files.errors";

import { File } from "./schemas/file.schema";

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(File.name)
    private readonly files: Model<File>,

    @InjectQueue("files")
    private readonly filesQueue: Queue
  ) {}

  async create(options: {
    filename: File["filename"];
    hidden?: File["hidden"];
    id: File["id"];
    public?: File["public"];
    size: File["size"];
    uid: File["uid"];
  }): Promise<File> {
    return new this.files(options).save();
  }

  async delete(id: string, uid: string): Promise<File> {
    const file = await this.findOne(id, uid);

    await this.filesQueue.add("delete", { fileId: file.id });
    await file.deleteOne();
    
    return file;
  }

  async deleteAllFor(uid: string): Promise<void> {
    await this.files
      .find({ uid })
      .cursor()
      .eachAsync(async (file: File) => {
        await this.filesQueue.add("delete", { fileId: file.id });
        await file.deleteOne();
      });
  }

  async findOne(id: string, uid: string): Promise<File> {
    const file = await this.files.findOne({ id, uid });
    if (!file) throw new FileNotFound(id);

    return file;
  }

  async findPublicFile(id: string): Promise<File> {
    const file = await this.files.findOne({ id, public: true });
    if (!file) throw new FileNotFound(id);

    return file;
  }

  async rename(id: string, newFilename: string, uid: string): Promise<File> {
    const file = await this.findOne(id, uid);

    return file.rename(newFilename);
  }
}
