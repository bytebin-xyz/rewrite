import path from "path";
import pump from "pump";

import { Readable } from "stream";
import { ReadStream, createReadStream, createWriteStream } from "fs";

import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { InjectQueue } from "@nestjs/bull";

import { Model } from "mongoose";
import { Queue } from "bull";

import {
  ChunkAlreadyUploaded,
  FileNotFound,
  MaxActiveUploadSessionsError,
  UploadSessionNotFound
} from "./files.errors";

import { File } from "./schemas/file.schema";
import { UploadSession } from "./schemas/upload-session.schema";

import { fileAccessibile } from "@/utils/fileAccessibile";
import { pathFromString } from "@/utils/pathFromString";

@Injectable()
export class FilesService {
  constructor(
    private readonly config: ConfigService,

    @InjectModel(File.name)
    private readonly files: Model<File>,

    @InjectModel(UploadSession.name)
    private readonly uploadSessions: Model<UploadSession>,

    @InjectQueue("files")
    private readonly filesQueue: Queue
  ) {}

  async commitUploadSession(id: string, uid: string): Promise<File> {
    const session = await this.uploadSessions.findOne({ id, uid });
    if (!session) throw new UploadSessionNotFound(id);

    const file = await this.create(
      session.filename,
      path.join(pathFromString(session.id), session.id),
      session.size,
      session.uid
    );

    await session.deleteOne();

    return file;
  }

  async create(filename: string, partialPath: string, size: number, uid: string): Promise<File> {
    return new this.files({ filename, partialPath, size, uid }).save();
  }

  async createDownloadStream(id: string, uid?: string): Promise<ReadStream> {
    const file = await this.files.findOne({ id, uid });
    if (!file) throw new FileNotFound(id);

    const fullPath = this.getFullPath(file.partialPath);
    if (!(await fileAccessibile(fullPath))) throw new FileNotFound(id);

    return createReadStream(fullPath);
  }

  async createUploadSession(filename: string, size: number, uid: string): Promise<UploadSession> {
    const activeUploadSessions = await this.uploadSessions.countDocuments({ uid });

    if (activeUploadSessions >= this.config.get("MAX_FILES_PER_UPLOAD")) {
      throw new MaxActiveUploadSessionsError();
    }

    return new this.uploadSessions({
      chunkSize: this.config.get("MAX_CHUNK_SIZE"),
      filename,
      size,
      uid
    }).save();
  }

  async delete(id: string, uid: string): Promise<File> {
    const file = await this.files.findOne({ id, uid });
    if (!file) throw new FileNotFound(id);

    await this.filesQueue.add("delete", {
      filename: file.filename,
      id: file.id,
      partialPath: file.partialPath
    });

    await file.deleteOne();

    return file;
  }

  async deleteAllFor(uid: string): Promise<void> {
    await this.files
      .find({ uid })
      .cursor()
      .eachAsync(async (file: File) => {
        await this.filesQueue.add("delete", {
          filename: file.filename,
          id: file.id,
          partialPath: file.partialPath
        });

        await file.deleteOne();
      });
  }

  async destroyUploadSession(id: string, uid: string): Promise<UploadSession> {
    const session = await this.uploadSessions.findOne({ id, uid });
    if (!session) throw new UploadSessionNotFound(id);

    if (session.chunksUploaded.length > 0) {
      await this.filesQueue.add("delete", {
        filename: session.filename,
        id: session.id,
        partialPath: session.partialPath
      });
    }

    await session.deleteOne();

    return session;
  }

  getFullPath(partialPath: string): string {
    return path.join(this.config.get("UPLOAD_DIRECTORY") as string, partialPath);
  }

  async rename(id: string, newFilename: string, uid: string): Promise<File> {
    const file = await this.files.findOne({ id, uid });
    if (!file) throw new FileNotFound(id);

    return file.rename(newFilename);
  }

  // TO-DO
  async writeChunk(
    id: string,
    chunk: Readable,
    chunkIndex: number,
    uid: string
  ): Promise<UploadSession> {
    const uploadSession = await this.uploadSessions.findOne({ id, uid });

    if (!uploadSession) {
      throw new UploadSessionNotFound(id);
    }

    if (uploadSession.chunksUploaded.includes(chunkIndex)) {
      throw new ChunkAlreadyUploaded(chunkIndex);
    }

    await pump(
      chunk,
      createWriteStream(this.getFullPath(uploadSession.partialPath), {
        flags: "r+",
        start: uploadSession.chunkSize * chunkIndex
      })
    );

    return uploadSession;
  }
}
