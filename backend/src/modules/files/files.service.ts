import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { InjectQueue } from "@nestjs/bull";

import { FilterQuery, Model } from "mongoose";
import { Queue } from "bull";

import { FileNotDeletable, FileNotFound } from "./files.errors";

import { File } from "./schemas/file.schema";

import { FolderNotFound } from "@/modules/folders/folders.errors";
import { FoldersService } from "@/modules/folders/folders.service";

@Injectable()
export class FilesService {
  constructor(
    @Inject(forwardRef(() => FoldersService))
    private readonly folders: FoldersService,

    @InjectModel(File.name)
    private readonly files: Model<File>,

    @InjectQueue("files")
    private readonly filesQueue: Queue
  ) {}

  async create(
    data: {
      deletable?: File["deletable"];
      filename: File["filename"];
      folder: string | null;
      hidden?: File["hidden"];
      id: File["id"];
      public?: File["public"];
      size: File["size"];
    },
    uid: string
  ): Promise<File> {
    const folder = data.folder
      ? await this.folders.findOne({ id: data.folder, uid }).then(folder => folder && folder.id)
      : null;

    if (!folder && data.folder) throw new FolderNotFound();

    return new this.files({ ...data, folder, uid }).save();
  }

  async delete(query: FilterQuery<File>): Promise<void> {
    await this.files
      .deleteMany(query)
      .cursor()
      .eachAsync(async (file: File) => {
        await this.filesQueue.add("delete", { fileId: file.id });
        await file.deleteOne();
      });
  }

  async deleteOne(query: FilterQuery<File>): Promise<File> {
    const file = await this.files.findOne(query);

    if (!file) throw new FileNotFound();
    if (!file.deletable) throw new FileNotDeletable();

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
      folder: string | null;
      hidden: boolean;
      public: boolean;
    }
  ): Promise<File> {
    const file = await this.files.findOne(query);
    if (!file) throw new FileNotFound();

    const folder = data.folder
      ? await this.folders
          .findOne({ id: data.folder, uid: file.uid })
          .then(folder => folder && folder.id)
      : null;

    if (!folder && data.folder) throw new FolderNotFound();

    file.filename = data.filename;
    file.folder = folder;
    file.hidden = data.hidden;
    file.public = data.public;

    return file.save();
  }
}
