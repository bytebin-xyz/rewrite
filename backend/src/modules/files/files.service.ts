import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { InjectQueue } from "@nestjs/bull";

import { FilterQuery, Model } from "mongoose";
import { Queue } from "bull";
import { Readable } from "stream";

import {
  EntryAlreadyExists,
  EntryNotDeletable,
  EntryNotFound,
  ParentDirectoryNotFound,
  ParentIsChildrenOfItself,
  ParentIsItself
} from "./files.errors";

import { Entry } from "./schemas/entry.schema";

import { StorageService } from "@/modules/storage/storage.service";

@Injectable()
export class FilesService {
  constructor(
    private readonly storage: StorageService,

    @InjectModel(Entry.name)
    private readonly entries: Model<Entry>,

    @InjectQueue("files")
    private readonly filesQueue: Queue
  ) {}

  async createEntry(data: {
    deletable: Entry["deletable"];
    hidden: Entry["hidden"];
    id?: Entry["id"];
    isDirectory: Entry["isDirectory"];
    isFile: Entry["isFile"];
    name: Entry["name"];
    parent: Entry["parent"];
    public: Entry["public"];
    size: Entry["size"];
    uid: Entry["uid"];
  }): Promise<Entry> {
    const parent = data.parent
      ? await this.entries
          .findOne({ id: data.parent, uid: data.uid })
          .then(entry => entry && entry.id)
      : null;

    if (!parent && data.parent) throw new ParentDirectoryNotFound();

    const copies = await this.entries.countDocuments({ name: data.name, parent, uid: data.uid });
    const entry = { ...data, parent };

    if (copies > 0) {
      if (!data.isFile) throw new EntryAlreadyExists(data.name);

      entry.name = this._renameWithIndex(data.name, copies);
    }

    return new this.entries(entry).save();
  }

  async createReadable(id: string, uid?: string): Promise<Readable> {
    const file = uid
      ? await this.entries.findOne({ id, isDirectory: false, isFile: true, uid })
      : await this.entries.findOne({ id, isDirectory: false, isFile: true, public: true });

    if (!file) throw new EntryNotFound();

    return this.storage.read(file.id);
  }

  async deleteMany(query: FilterQuery<Entry>): Promise<void> {
    // We have to use .remove on each individual document so that middlewares are executed
    await this.entries
      .find(query)
      .cursor()
      .eachAsync(async (entry: Entry) => {
        if (entry.isFile) {
          await this.filesQueue.add("delete", { fileId: entry.id });
        }

        await entry.remove();
      });
  }

  async deleteOne(query: FilterQuery<Entry>): Promise<Entry> {
    const entry = await this.entries.findOne(query);

    if (!entry) throw new EntryNotFound();
    if (!entry.deletable) throw new EntryNotDeletable();

    await entry
      .getChildren({ isFile: true })
      .eachAsync(child => this.filesQueue.add("delete", { fileId: child.id }));

    return entry.remove();
  }

  async exists(query: FilterQuery<Entry>): Promise<boolean> {
    return this.entries.exists(query);
  }

  async find(query: FilterQuery<Entry>): Promise<Entry[]> {
    return this.entries.find(query);
  }

  async findOne(query: FilterQuery<Entry>): Promise<Entry | null> {
    return this.entries.findOne(query);
  }

  async updateOne(
    query: FilterQuery<Entry>,
    data: {
      deletable: Entry["deletable"];
      hidden: Entry["hidden"];
      name: Entry["name"];
      parent: Entry["parent"];
      public: Entry["public"];
    }
  ): Promise<Entry> {
    const entry = await this.entries.findOne(query);
    if (!entry) throw new EntryNotFound();

    const parent = data.parent
      ? await this._validateParent(entry, data.parent).then(parent => parent.id)
      : null;

    entry.hidden = data.hidden;
    entry.parent = parent;
    entry.public = data.public;
    entry.name = data.name;

    return entry.save();
  }

  private _renameWithIndex(filename: string, index: number): string {
    // If filename has no extension
    if (!filename.includes(".")) return `${filename} (${index})`;

    const parts = filename.split(".");

    parts[parts.length - 2] += ` (${index})`;

    return parts.join(".").trim();
  }

  private async _validateParent(entry: Entry, parentId: string): Promise<Entry> {
    const parent = await this.entries.findOne({ id: parentId, uid: entry.uid });

    if (!parent) throw new ParentDirectoryNotFound();
    if (parent.id === entry.id) throw new ParentIsItself();
    if (parent.path.startsWith(`${entry.path}/`)) throw new ParentIsChildrenOfItself();

    return parent;
  }
}
