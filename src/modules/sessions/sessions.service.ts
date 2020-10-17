import { Connection, MongooseFilterQuery } from "mongoose";

import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";

import { Session } from "@/interfaces/session.interface";

@Injectable()
export class SessionsService {
  private sessions = this.connection.db.collection<Session>("sessions");

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async deleteMany(query: MongooseFilterQuery<Session>): Promise<void> {
    await this.sessions.deleteMany(query);
  }

  async deleteOne(query: MongooseFilterQuery<Session>): Promise<void> {
    await this.sessions.deleteOne(query);
  }

  find(query: MongooseFilterQuery<Session>): Promise<Session[]> {
    return this.sessions.find(query).toArray();
  }

  findOne(query: MongooseFilterQuery<Session>): Promise<Session | null> {
    return this.sessions.findOne(query);
  }
}
