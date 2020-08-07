import crypto from "crypto";

import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { Model } from "mongoose";

import { ApplicationNotFound } from "./applications.errors";

import { Application } from "./schemas/application.schema";

import { generateId } from "@/utils/generateId";

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

    return application.deleteOne();
  }

  async findOne(id: string, uid: string): Promise<Application> {
    const application = await this.applications.findOne({ id, uid });
    if (!application) throw new ApplicationNotFound(id);

    return application;
  }

  // TODO: WIP
  async generateToken(id: string, uid: string): Promise<{ token: string }> {
    const application = await this.findOne(id, uid);
    const token = await generateId(16);

    await application.changeToken(token);

    return {
      token: crypto
        .createHmac("sha256", this.config.get("API_SECRET") as string)
        .update(token)
        .digest("hex")
    };
  }
}
