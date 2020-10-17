import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { FilterQuery, Model, Types } from "mongoose";

import {
  ApplicationAlreadyExists,
  ApplicationNotFound,
  TooManyApplications
} from "./applications.errors";

import { ApplicationScopes } from "./enums/application-scopes.enum";

import { Application } from "./schemas/application.schema";

import { config } from "@/config";

@Injectable()
export class ApplicationsService {
  constructor(
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

  async createKey(query: FilterQuery<Application>): Promise<string> {
    const application = await this.applications.findOne(query);
    if (!application) throw new ApplicationNotFound();

    return application.createKey(config.get("secrets").applications);
  }

  async deleteMany(query: FilterQuery<Application>): Promise<void> {
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

  async updateOne(
    query: FilterQuery<Application>,
    data: {
      name: Application["name"];
      scopes: ApplicationScopes[];
    }
  ): Promise<Application> {
    const application = await this.applications.findOne(query);
    if (!application) throw new ApplicationNotFound();

    application.name = data.name;
    application.scopes = new Types.Array<ApplicationScopes>();

    Array
      .from(new Set(data.scopes))
      .forEach((scope) => application.scopes.addToSet(scope)); // prettier-ignore

    return application.save();
  }
}
