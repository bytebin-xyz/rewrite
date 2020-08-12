import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { InjectQueue } from "@nestjs/bull";

import { FilterQuery, Model } from "mongoose";
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

  async create(data: {
    filename: File["filename"];
    hidden?: File["hidden"];
    id: File["id"];
    public?: File["public"];
    size: File["size"];
    uid: File["uid"];
  }): Promise<File> {
    return new this.files(data).save();
  }

  async delete(query: FilterQuery<File>): Promise<void> {
    await this.files
      .find(query)
      .cursor()
      .eachAsync(async (file: File) => {
        await this.filesQueue.add("delete", { fileId: file.id });
        await file.deleteOne();
      });
  }

  async deleteOne(query: FilterQuery<File>): Promise<File> {
    const file = await this.files.findOne(query);
    if (!file) throw new FileNotFound();

    await this.filesQueue.add("delete", { fileId: file.id });
    await file.deleteOne();

    return file;
  }

  async find(query: FilterQuery<File>): Promise<File[]> {
    return this.files.find(query);
  }

  async findOne(query: FilterQuery<File>): Promise<File | null> {
    return this.files.findOne(query);
  }

  async updateOne(
    query: FilterQuery<File>,
    data: {
      filename: string;
      hidden: boolean;
      public: boolean;
    }
  ): Promise<File> {
    const file = await this.files.findOne(query);
    if (!file) throw new FileNotFound();

    return file.updateOne(data);
  }
}
