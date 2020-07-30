import fs from "fs";

import { Inject, Injectable, Logger, LoggerService } from "@nestjs/common";
import { OnQueueError, OnQueueFailed, OnQueueStalled, Process, Processor } from "@nestjs/bull";

import { Job } from "bull";

import { FilesService } from "./files.service";

import { DeleteFileJob } from "./jobs/delete-file.job";

@Injectable()
@Processor("files")
export class FilesProcessor {
  constructor(
    private readonly files: FilesService,

    @Inject(Logger)
    private readonly logger: LoggerService
  ) {}

  @OnQueueError()
  handleError(error: Error): void {
    this.logger.error(error);
  }

  @OnQueueFailed()
  handleFailure(job: Job): void {
    this._debug(`[Job ${job.id}] Job has failed to ${job.name} because ${job.failedReason}`);
  }

  @OnQueueStalled()
  handleStall(job: Job): void {
    this._debug(`[Job ${job.id}] Job stalled on ${job.name}`);
  }

  @Process("delete")
  async handleFileDeletion(job: Job<DeleteFileJob>): Promise<void> {
    const { filename, id, partialPath } = job.data;
    const fullPath = this.files.getFullPath(partialPath);

    this._debug(`[Job ${job.id}] Deleting ${filename} (${id}) from ${fullPath}`);

    await fs.promises.unlink(fullPath).then(() => job.progress(100));

    this._debug(`[Job ${job.id}] Successfully deleted ${filename} (${id}) from ${fullPath}`);
  }

  private _debug(message: string) {
    this.logger.debug && this.logger.debug(message, "FilesProcessor");
  }
}
