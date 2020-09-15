import path from "path";

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { InjectQueue } from "@nestjs/bull";

import { FilterQuery, Model, QueryFindBaseOptions, QueryFindOptions } from "mongoose";
import { Queue } from "bull";
import { Readable } from "stream";

import {
  EntryAlreadyExists,
  EntryNotDeletable,
  EntryNotFound,
  ParentFolderNotFound,
  ParentIsChildrenOfItself,
  ParentIsItself
} from "./files.errors";

import { Entry, ENTRY_COLLATION_OPTIONS } from "./schemas/entry.schema";

import { StorageService } from "@/modules/storage/storage.service";

import { clamp } from "@/utils/clamp";
import { paginate, Pagination } from "@/utils/paginate";

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
    folder: Entry["folder"];
    hidden: Entry["hidden"];
    id?: Entry["id"];
    isFile: Entry["isFile"];
    isFolder: Entry["isFolder"];
    name: Entry["name"];
    public: Entry["public"];
    size: Entry["size"];
    uid: Entry["uid"];
  }): Promise<Entry> {
    const folder = data.folder ? await this.findOne({ id: data.folder, uid: data.uid }) : null;
    if (!folder && data.folder) throw new ParentFolderNotFound();

    const folderId = folder && folder.id;
    const folderPath = (folder && folder.path) || "/";

    const duplicates = await this.hasDuplicates(data.name, { folder: folderId, uid: data.uid });
    if (duplicates && !data.isFile) throw new EntryAlreadyExists(data.name, folderPath);

    return new this.entries({
      ...data,
      folder: folderId,
      name: this._renameWithIndex(data.name, duplicates)
    }).save();
  }

  async createReadable(id: string, uid?: string): Promise<Readable> {
    const file = uid
      ? await this.findOne({ id, isFile: true, isFolder: false, uid })
      : await this.findOne({ id, isFile: true, isFolder: false, public: true });

    if (!file) throw new EntryNotFound();

    return this.storage.read(file.id);
  }

  async deleteMany(query: FilterQuery<Entry>): Promise<void> {
    // We have to use .remove on each individual document so that middlewares are executed
    await this.entries
      .find(query)
      .collation(ENTRY_COLLATION_OPTIONS)
      .cursor()
      .eachAsync(async (entry: Entry) => {
        if (entry.isFile) {
          await this.filesQueue.add("delete", { fileId: entry.id });
        }

        await entry.remove();
      });
  }

  async deleteOne(query: FilterQuery<Entry>): Promise<Entry> {
    const entry = await this.findOne(query);

    if (!entry) throw new EntryNotFound();
    if (!entry.deletable) throw new EntryNotDeletable();

    await entry
      .getChildren({ isFile: true })
      .eachAsync((child) => this.filesQueue.add("delete", { fileId: child.id }));

    return entry.remove();
  }

  async exists(query: FilterQuery<Entry>): Promise<boolean> {
    return this.entries
      .findOne(query)
      .collation(ENTRY_COLLATION_OPTIONS)
      .select({ _id: 1 })
      .lean()
      .then((doc) => !!doc);
  }

  async find(query: FilterQuery<Entry>, options: QueryFindOptions = {}): Promise<Entry[]> {
    return this.entries.find(query, undefined, options).collation(ENTRY_COLLATION_OPTIONS);
  }

  async findOne(
    query: FilterQuery<Entry>,
    options: QueryFindBaseOptions = {}
  ): Promise<Entry | null> {
    return this.entries.findOne(query, undefined, options).collation(ENTRY_COLLATION_OPTIONS);
  }

  async hasDuplicates(entryName: string, query: FilterQuery<Omit<Entry, "name">>): Promise<number> {
    const { ext, name } = path.parse(entryName);

    const regexp = ext
      ? new RegExp(`${name}( \\([0-9]+\\))+\\${ext}`)
      : new RegExp(`${name}( \\([0-9]+\\))+`);

    return this.entries
      .countDocuments({ $or: [{ name: name + ext }, { name: regexp }], ...query })
      .collation(ENTRY_COLLATION_OPTIONS);
  }

  async list(
    query: FilterQuery<Entry>,
    options: {
      cursor?: number;
      limit: number;
    }
  ): Promise<Pagination<Entry>> {
    return paginate(this.entries, {
      collation: ENTRY_COLLATION_OPTIONS,
      cursor: options.cursor,
      field: "timestamp",
      limit: clamp(1, 100, options.limit),
      query,
      sort: {
        isFolder: -1
      }
    });
  }

  async updateOne(
    query: FilterQuery<Entry>,
    data: {
      deletable: Entry["deletable"];
      folder: Entry["folder"];
      hidden: Entry["hidden"];
      name: Entry["name"];
      public: Entry["public"];
    }
  ): Promise<Entry> {
    const entry = await this.findOne(query);
    if (!entry) throw new EntryNotFound();

    const folder = data.folder
      ? this._validateParent(entry, await this.findOne({ id: data.folder, uid: entry.uid }))
      : null;

    const folderId = folder && folder.id;
    const folderPath = (folder && folder.path) || "/";

    const exists = data.name !== entry.name && (await this.exists({ folder: folderId, name: data.name, uid: entry.uid })); // prettier-ignore
    if (exists) throw new EntryAlreadyExists(data.name, folderPath);

    entry.folder = folderId;
    entry.hidden = data.hidden;
    entry.name = data.name;
    entry.public = data.public;

    return entry.save();
  }

  private _renameWithIndex(entryName: string, index: number): string {
    if (index <= 0) return entryName;

    const { ext, name } = path.parse(entryName);

    return path.format({ ext, name: `${name} (${index})` });
  }

  private _validateParent(entry: Entry, folder?: Entry | null): Entry {
    if (!folder) throw new ParentFolderNotFound();
    if (folder.id === entry.id) throw new ParentIsItself();
    if (folder.path.startsWith(`${entry.path}/`)) throw new ParentIsChildrenOfItself();

    return folder;
  }
}
