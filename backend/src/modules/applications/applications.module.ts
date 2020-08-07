import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ApplicationsController } from "./applications.controller";
import { ApplicationsService } from "./applications.service";

import { UsersModule } from "@/modules/users/users.module";
import { Application, ApplicationSchema } from "./schemas/application.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Application.name, schema: ApplicationSchema }]),
    UsersModule
  ],
  exports: [ApplicationsService],
  controllers: [ApplicationsController],
  providers: [ApplicationsService]
})
export class ApplicationsModule {}
