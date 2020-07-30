import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";

import { Queue } from "bull";

import { setQueues } from "bull-board";

@Injectable()
export class BullBoardProvider {
  constructor(
    @InjectQueue("files")
    private readonly filesQueue: Queue
  ) {
    setQueues([this.filesQueue]);
  }
}
