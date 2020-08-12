import { Connection, FilterQuery } from "mongoose";

import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";

import { ISession } from "./interfaces/session.interface";

@Injectable()
export class SessionsService {
  private sessions = this.connection.db.collection<ISession>("sessions");

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async delete(query: FilterQuery<ISession>): Promise<void> {
    await this.sessions.deleteMany(query);
  }

  async deleteOne(query: FilterQuery<ISession>): Promise<void> {
    await this.sessions.deleteOne(query);
  }

  find(query: FilterQuery<ISession>): Promise<ISession[]> {
    return this.sessions.find(query).toArray();
  }

  findOne(query: FilterQuery<ISession>): Promise<ISession | null> {
    return this.sessions.findOne(query);
  }
}
