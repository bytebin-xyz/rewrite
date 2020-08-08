import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { Model } from "mongoose";

import { ApplicationNotFound } from "./applications.errors";

import { Application } from "./schemas/application.schema";

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly config: ConfigService,

    @InjectModel(Application.name)
    private readonly applications: Model<Application>
  ) {}

  async create(name: string, uid: string): Promise<Application> {
    return new this.applications({ name, uid }).save();
  }

  async delete(id: string, uid: string): Promise<Application> {
    const application = await this.findOne(id, uid);
    if (!application) throw new ApplicationNotFound(id);

    return application.deleteOne();
  }

  async deleteAllFor(uid: string): Promise<void> {
    await this.applications.deleteMany({ uid });
  }

  async findOne(id: string, uid?: string): Promise<Application | null> {
    return this.applications.findOne(uid ? { id, uid } : { id });
  }

  async generateKey(id: string, uid: string): Promise<string> {
    const application = await this.findOne(id, uid);
    if (!application) throw new ApplicationNotFound(id);

    return application.generateKey(this.config.get("API_SECRET") as string);
  }
}
