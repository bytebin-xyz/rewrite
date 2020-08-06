import { Inject, Injectable, Logger, LoggerService } from "@nestjs/common";
import { OnQueueError, OnQueueFailed, OnQueueStalled, Process, Processor } from "@nestjs/bull";

import { Job } from "bull";

import { DeleteFileJob } from "./jobs/delete-file.job";

import { StorageService } from "@/modules/storage/storage.service";

@Injectable()
@Processor("files")
export class FilesProcessor {
  constructor(
    @Inject(Logger)
    private readonly logger: LoggerService,
    private readonly storage: StorageService
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
    this._debug(`[Job ${job.id}] Deleting ${job.data.fileId}`);

    await this.storage.delete(job.data.fileId);
    await job.progress(100);

    this._debug(`[Job ${job.id}] Successfully deleted ${job.data.fileId}`);
  }

  private _debug(message: string) {
    this.logger.debug && this.logger.debug(message, FilesProcessor.name);
  }
}
