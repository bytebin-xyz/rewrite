import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { Model } from "mongoose";

import {
  ApplicationAlreadyExists,
  ApplicationNotFound,
  TooManyApplications
} from "./applications.errors";

import { ApplicationScopes } from "./enums/application-scopes.enum";

import { Application } from "./schemas/application.schema";

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly config: ConfigService,

    @InjectModel(Application.name)
    private readonly applications: Model<Application>
  ) {}

  async create(name: string, scopes: ApplicationScopes[], uid: string): Promise<Application> {
    if ((await this.applications.countDocuments({ uid })) > 50) {
      throw new TooManyApplications();
    }

    if (await this.applications.exists({ name, uid })) {
      throw new ApplicationAlreadyExists(name);
    }

    return new this.applications({ name, scopes, uid }).save();
  }

  async delete(id: string, uid: string): Promise<Application> {
    const application = await this.findOne(id, uid);
    if (!application) throw new ApplicationNotFound(id);

    return application.deleteOne();
  }

  async deleteAllFor(uid: string): Promise<void> {
    await this.applications.deleteMany({ uid });
  }

  async find(uid: string): Promise<Application[]> {
    return this.applications.find({ uid }).sort("-lastUsed");
  }

  async findOne(id: string, uid?: string): Promise<Application | null> {
    return this.applications.findOne(uid ? { id, uid } : { id });
  }

  async generateKey(id: string, uid: string): Promise<string> {
    const application = await this.findOne(id, uid);
    if (!application) throw new ApplicationNotFound(id);

    return application.generateKey(this.config.get("API_KEY_SECRET") as string);
  }

  async updateScopes(id: string, scopes: ApplicationScopes[], uid: string): Promise<Application> {
    const application = await this.findOne(id, uid);
    if (!application) throw new ApplicationNotFound(id);

    return application.updateScopes(scopes);
  }
}
