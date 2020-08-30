import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { FilterQuery, Model } from "mongoose";

import {
  FolderAlreadyExists,
  FolderNotFound,
  ParentFolderNotFound,
  ParentFolderIsItself,
  ParentFolderIsChildrenOfItself
} from "./folders.errors";

import { Folder } from "./schemas/folder.schema";

import { FilesService } from "@/modules/files/files.service";

import { settle } from "@/utils/settle";

@Injectable()
export class FoldersService {
  constructor(
    @Inject(forwardRef(() => FilesService))
    private readonly files: FilesService,

    @InjectModel(Folder.name)
    private readonly folders: Model<Folder>
  ) {}

  async create(
    data: {
      name: string;
      parent: string | null;
    },
    uid: string
  ): Promise<Folder> {
    const parent = data.parent
      ? await this.folders.findOne({ id: data.parent, uid }).then(parent => parent && parent.id)
      : null;

    if (!parent && data.parent) throw new ParentFolderNotFound();

    const exists = await this.folders.exists({ name: data.name, parent, uid });
    if (exists) throw new FolderAlreadyExists(data.name);

    return new this.folders({ name: data.name, parent, uid }).save();
  }

  async delete(query: FilterQuery<Folder>): Promise<void> {
    await this.folders.deleteMany(query);
  }

  async deleteOne(query: FilterQuery<Folder>): Promise<Folder> {
    const folder = await this.folders.findOne(query);
    if (!folder) throw new FolderNotFound();

    const path = { $regex: `^${folder.path}/` };

    await settle([
      this.files.delete({ deletable: true, path, uid: folder.uid }),
      this.folders.deleteMany({ path, uid: folder.uid })
    ]);

    return folder.deleteOne();
  }

  async exists(query: FilterQuery<Folder>): Promise<boolean> {
    return this.folders.exists(query);
  }

  async find(query: FilterQuery<Folder>): Promise<Folder[]> {
    return this.folders.find(query);
  }

  async findOne(query: FilterQuery<Folder>): Promise<Folder | null> {
    return this.folders.findOne(query);
  }

  async updateOne(
    query: FilterQuery<Folder>,
    data: {
      name: string;
      parent: string | null;
    }
  ): Promise<Folder> {
    const folder = await this.folders.findOne(query);
    if (!folder) throw new FolderNotFound();

    folder.name = data.name;

    if (data.parent) {
      if (data.parent === folder.id) throw new ParentFolderIsItself();

      const parentFolder = await this.folders.findOne({ id: data.parent, uid: folder.uid });
      if (!parentFolder) throw new ParentFolderNotFound();

      if (parentFolder.path.startsWith(`${folder.path}/`)) {
        throw new ParentFolderIsChildrenOfItself();
      }

      folder.parent = parentFolder.id;
    } else {
      folder.parent = null;
    }

    return folder.save();
  }
}
