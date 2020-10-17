import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Process, Processor } from "@nestjs/bull";

import { Job } from "bull";
import { Model } from "mongoose";

import { DeleteFileJob } from "./jobs/delete-file.job";

import { File } from "./schemas/file.schema";

import { StorageService } from "@/modules/storage/storage.service";

@Injectable()
@Processor("files")
export class FilesProcessor {
  constructor(
    private readonly storage: StorageService,

    @InjectModel(File.name)
    private readonly filesModel: Model<File>
  ) {}

  @Process("deleteMany")
  async deleteMany(job: Job<DeleteFileJob>): Promise<void> {
    const query = this.filesModel.find(job.data);
    const total = await query.countDocuments();

    if (total <= 0) return job.progress(100);

    let deleted = 0;

    await query.cursor().eachAsync(async (file) => {
      if (file.writtenTo) {
        await this.storage.delete(file.writtenTo);
      }

      await file.remove();
      await job.progress((++deleted / total) * 100);
    });
  }

  @Process("deleteOne")
  async deleteOne(job: Job<DeleteFileJob>): Promise<void> {
    const file = await this.filesModel.findOne(job.data);

    if (file) {
      if (file.writtenTo) {
        await this.storage.delete(file.writtenTo);
      }

      await file.remove();
    }

    await job.progress(100);
  }
}
