import { CollationOptions, FilterQuery, Model } from "mongoose";

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { EmailAlreadyExists, UsernameAlreadyExists } from "./users.errors";

import { User } from "./schemas/user.schema";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly users: Model<User>) {}

  async create(email: string, password: string, username: string): Promise<User> {
    if (await this.users.exists({ email })) throw new EmailAlreadyExists(email);
    if (await this.users.exists({ username })) throw new UsernameAlreadyExists(username);

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
}
