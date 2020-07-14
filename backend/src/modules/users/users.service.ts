import { CollationOptions, FilterQuery, Model } from "mongoose";
import { plainToClass } from "class-transformer";

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { PartialUser } from "./schemas/partial-user.schema";
import { User } from "./schemas/user.schema";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly users: Model<User>) {}

  create(email: string, password: string, username: string): Promise<User> {
    return new this.users({ displayName: username, email, password, username }).save();
  }

  async findOne(query: FilterQuery<User>): Promise<User | null> {
    return this.users.findOne({ ...query, deleted: false });
  }

  exists(query: FilterQuery<User>, collation?: CollationOptions): Promise<boolean> {
    if (!collation) return this.users.exists(query);

    return this.users
      .countDocuments(query)
      .collation(collation)
      .then(count => !!count);
  }

  async search(query: FilterQuery<PartialUser>): Promise<PartialUser | null> {
    const user = await this.findOne(query);
    if (user) return plainToClass(PartialUser, user.toObject());

    return null;
  }
}
