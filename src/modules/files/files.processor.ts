import { Injectable } from "@nestjs/common";
import { Process, Processor } from "@nestjs/bull";

import { Job } from "bull";

import { DeleteFileJob } from "./jobs/delete-file.job";

import { StorageService } from "@/modules/storage/storage.service";

@Injectable()
@Processor("files")
export class FilesProcessor {
  constructor(private readonly storage: StorageService) {}

  @Process("delete")
  async handleFileDeletion(job: Job<DeleteFileJob>): Promise<void> {
    await this.storage.delete(job.data.fileId);
    await job.progress(100);
  }
}
