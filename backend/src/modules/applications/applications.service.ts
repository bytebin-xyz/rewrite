import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { FilterQuery, Model } from "mongoose";

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

  async create(data: {
    name: Application["name"];
    scopes: ApplicationScopes[];
    uid: Application["uid"];
  }): Promise<Application> {
    const { name, uid } = data;

    if ((await this.applications.countDocuments({ uid })) > 50) {
      throw new TooManyApplications();
    }

    if (await this.applications.exists({ name, uid })) {
      throw new ApplicationAlreadyExists(name);
    }

    return new this.applications(data).save();
  }

  async delete(query: FilterQuery<Application>): Promise<void> {
    await this.applications.deleteMany(query);
  }

  async deleteOne(query: FilterQuery<Application>): Promise<Application> {
    const application = await this.applications.findOne(query);
    if (!application) throw new ApplicationNotFound();

    return application.deleteOne();
  }

  async find(query: FilterQuery<Application>): Promise<Application[]> {
    return this.applications.find(query).sort("-lastUsed");
  }

  async findOne(query: FilterQuery<Application>): Promise<Application | null> {
    return this.applications.findOne(query);
  }

  async generateKey(query: FilterQuery<Application>): Promise<string> {
    const application = await this.applications.findOne(query);
    if (!application) throw new ApplicationNotFound();

    return application.generateKey(this.config.get("API_KEY_SECRET") as string);
  }

  async updateOne(
    query: FilterQuery<Application>,
    data: {
      name: Application["name"];
      scopes: ApplicationScopes[];
    }
  ): Promise<Application> {
    const application = await this.applications.findOne(query);
    if (!application) throw new ApplicationNotFound();

    return application.updateOne({
      name: data.name,
      scopes: Array.from(new Set(data.scopes))
    });
  }
}
