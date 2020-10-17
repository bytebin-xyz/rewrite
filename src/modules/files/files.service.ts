import * as path from "path";

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { InjectQueue } from "@nestjs/bull";

import { DocumentQuery, Model, MongooseFilterQuery } from "mongoose";

import { Queue } from "bull";

import { Readable } from "stream";

import {
  FileAlreadyExists,
  FileNotFound,
  InsufficientCapabilitiesOnFile,
  ParentIsChildrenOfItself,
  ParentIsItself,
  ParentNotFound
} from "./files.errors";

import { FileTypes } from "./enums/file-types.enum";

import { File } from "./schemas/file.schema";

import { StorageService } from "@/modules/storage/storage.service";

import { escapeRegExp } from "@/utils/escapeRegExp";

@Injectable()
export class FilesService {
  constructor(
    private readonly storage: StorageService,

    @InjectModel(File.name)
    private readonly filesModel: Model<File>,

    @InjectQueue("files")
    private readonly filesQueue: Queue
  ) {}

  async copy(
    source: MongooseFilterQuery<File>,
    destination: MongooseFilterQuery<File>
  ): Promise<File> {
    const file = await this.filesModel.findOne(source);

    if (!file) {
      throw new FileNotFound();
    }

    if (!file.capabilities.canCopy) {
      throw new InsufficientCapabilitiesOnFile("canCopy");
    }

    const parent = await this.filesModel.findOne(destination);

    if (!parent) {
      throw new ParentNotFound();
    }

    if (!parent.capabilities.canAddChildren) {
      throw new InsufficientCapabilitiesOnFile("canAddChildren");
    }

    const exists = await this.exists({
      name: file.name,
      parent: parent.path,
      uid: file.uid
    });

    if (exists) {
      throw new FileAlreadyExists(file.name, parent.path);
    }

    return new this.filesModel({
      capabilities: file.capabilities,
      name: file.name,
      parent: destination.path,
      size: file.size,
      type: file.type,
      uid: file.uid,
      writtenTo: file.writtenTo
    }).save();
  }

  async create(
    file: {
      capabilities: File["capabilities"];
      name: string;
      parent: string | null;
      size?: number;
      type: FileTypes;
      uid: string;
      writtenTo: string | null;
    },
    options?: {
      autorename?: boolean;
      force?: boolean;
      isRoot?: boolean;
    }
  ): Promise<File> {
    if (options?.isRoot) {
      const duplicates = await this.duplicates(file.name, {
        parent: null,
        uid: file.uid
      });

      if (duplicates && !options?.autorename) {
        throw new FileAlreadyExists(file.name, "/");
      }

      return new this.filesModel({
        ...file,
        name: this._renameWithIndex(file.name, duplicates),
        parent: null
      }).save();
    }

    const parent = file.parent
      ? await this.findOne({ id: file.parent, uid: file.uid })
      : await this.findOne({ parent: null, uid: file.uid });

    if (!parent) {
      throw new ParentNotFound();
    }

    if (!parent.capabilities.canAddChildren && !options?.force) {
      throw new InsufficientCapabilitiesOnFile("canAddChildren");
    }

    const duplicates = await this.duplicates(file.name, {
      parent: parent.path,
      uid: file.uid
    });

    if (duplicates && !options?.autorename) {
      throw new FileAlreadyExists(file.name, parent.path);
    }

    return new this.filesModel({
      ...file,
      name: this._renameWithIndex(file.name, duplicates),
      parent: parent.path
    }).save();
  }

  async createReadable(
    conditions: MongooseFilterQuery<File>
  ): Promise<Readable> {
    const file = await this.findOne(conditions);

    if (!file) {
      throw new FileNotFound();
    }

    if (
      !file.capabilities.canDownload ||
      !file.writtenTo ||
      file.type !== FileTypes.File
    ) {
      throw new InsufficientCapabilitiesOnFile("canDownload");
    }

    return this.storage.read(file.writtenTo);
  }

  // Deletes all children directory and files regardless if its deletable or not
  async deleteMany(conditions: MongooseFilterQuery<File>): Promise<void> {
    // Mark files as deleted
    await this.filesModel.updateMany(conditions, { "state.isDeleted": true });

    // Add files to deletion queue
    await this.filesQueue.add("deleteMany", {
      ...conditions,
      type: FileTypes.File
    });

    // Delete remaining directories
    await this.filesModel.deleteMany({
      ...conditions,
      type: FileTypes.Directory
    });
  }

  async deleteOne(
    conditions: MongooseFilterQuery<File>,
    force = false
  ): Promise<File> {
    const file = await this.findOne(conditions);

    if (!file) {
      throw new FileNotFound();
    }

    if (!file.capabilities.canDelete && !force) {
      throw new InsufficientCapabilitiesOnFile("canDelete");
    }

    switch (file.type) {
      case FileTypes.Directory:
        await this.deleteMany({
          parent: { $regex: `^${escapeRegExp(file.path)}` },
          uid: file.uid
        });

        await file.remove();

        break;

      case FileTypes.File:
        // Find how many references to the actual file on disk
        const copies = await this.filesModel.countDocuments({
          "state.isDeleted": false,
          writtenTo: file.writtenTo
        });

        if (copies <= 1) {
          // If there is only reference, mark the file to be deleted
          await this.filesModel.updateOne(
            { writtenTo: file.writtenTo },
            { "state.isDeleted": true }
          );

          // Then add the file to the deletion queue
          await this.filesQueue.add("deleteOne", {
            writtenTo: file.writtenTo
          });
        } else {
          // Otherwise, delete only the reference from the database and not the file
          await file.remove();
        }

        break;
    }

    return file;
  }

  async duplicates(
    filename: string,
    conditions: MongooseFilterQuery<File>
  ): Promise<number> {
    const { ext, name } = path.posix.parse(filename);

    const regexp = ext
      ? new RegExp(`${escapeRegExp(name)}( \\([0-9]+\\))+${escapeRegExp(ext)}`)
      : new RegExp(`${escapeRegExp(name)}( \\([0-9]+\\))+`);

    delete conditions.name;

    return this.filesModel.countDocuments({
      ...conditions,
      $or: [{ name: filename }, { name: regexp }],
      "state.isDeleted": false
    });
  }

  exists(conditions: MongooseFilterQuery<File>): Promise<boolean> {
    return this.filesModel.exists({ ...conditions, "state.isDeleted": false });
  }

  find(conditions: MongooseFilterQuery<File>): DocumentQuery<File[], File> {
    return this.filesModel.find({ ...conditions, "state.isDeleted": false });
  }

  async findOne(conditions: MongooseFilterQuery<File>): Promise<File | null> {
    return this.filesModel.findOne({ ...conditions, "state.isDeleted": false });
  }

  async move(
    source: MongooseFilterQuery<File>,
    destination: MongooseFilterQuery<File>,
    force = false
  ): Promise<File> {
    const file = await this.findOne(source);

    if (!file) {
      throw new FileNotFound();
    }

    if (!file.capabilities.canMove && !force) {
      throw new InsufficientCapabilitiesOnFile("canMove");
    }

    const parent = await this.findOne(destination);

    if (!parent) {
      throw new ParentNotFound();
    }

    if (!parent.capabilities.canAddChildren) {
      throw new InsufficientCapabilitiesOnFile("canAddChildren");
    }

    if (parent.id === file.id) {
      throw new ParentIsItself();
    }

    if (parent.path.startsWith(`${file.path}/`)) {
      throw new ParentIsChildrenOfItself(file.name, parent.path);
    }

    const exists = await this.exists({
      name: file.name,
      parent: parent.path,
      uid: file.uid
    });

    if (exists) {
      throw new FileAlreadyExists(file.name, parent.path);
    }

    if (file.type === FileTypes.Directory) {
      await this._rebuildChildrenPaths(
        file,
        // /(root)/hello => /(root)/goodbye = /(root)/goodbye/hello
        path.posix.join(parent.path, file.name)
      );
    }

    file.parent = parent.path;

    return file.save();
  }

  async rename(
    condtions: MongooseFilterQuery<File>,
    newName: string,
    force = false
  ): Promise<File> {
    const file = await this.findOne(condtions);

    if (!file) {
      throw new FileNotFound();
    }

    if (!file.capabilities.canRename && !force) {
      throw new InsufficientCapabilitiesOnFile("canRename");
    }

    const exists = await this.exists({
      name: newName,
      parent: file.parent,
      uid: file.uid
    });

    if (exists) {
      throw new FileAlreadyExists(newName, file.parent || "/");
    }

    if (file.type === FileTypes.Directory) {
      await this._rebuildChildrenPaths(
        file,
        path.posix.join(file.parent || "/", newName)
      );
    }

    file.name = newName;

    return file.save();
  }

  private async _rebuildChildrenPaths(
    parent: File,
    newParentPath: string
  ): Promise<void> {
    await this.filesModel.updateMany(
      {
        parent: { $regex: `^${escapeRegExp(parent.path)}` },
        uid: parent.uid
      },
      [
        {
          $set: {
            parent: {
              $replaceOne: {
                input: "$parent",
                find: parent.path,
                replacement: newParentPath
              }
            }
          }
        }
      ]
    );
  }

  private _renameWithIndex(filename: string, index: number): string {
    if (index <= 0) return filename;

    const { ext, name } = path.posix.parse(filename);

    return path.posix.format({ ext, name: `${name} (${index})` });
  }
}
