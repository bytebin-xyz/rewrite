import { UI as BullUI } from "bull-board";

import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";

import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

import { AdminMiddleware } from "@/middlewares/admin.middleware";

@Module({
  exports: [AdminService],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AdminMiddleware, BullUI)
      .forRoutes({ method: RequestMethod.ALL, path: "/admin/queues" });
  }
}
