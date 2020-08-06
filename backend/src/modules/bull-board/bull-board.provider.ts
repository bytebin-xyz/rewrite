import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";

import { Queue } from "bull";

import { setQueues } from "bull-board";

@Injectable()
export class BullBoardProvider {
  constructor(
    // From nodemailer global module
    @InjectQueue("emails")
    private readonly emailsQueue: Queue,

    @InjectQueue("files")
    private readonly filesQueue: Queue
  ) {
    setQueues([this.emailsQueue, this.filesQueue]);
  }
}
