import * as bcrypt from "bcrypt";

import { FilterQuery, Model } from "mongoose";

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { PartialUser, User } from "./interfaces/user.interface";

import { generateId } from "~common/utils/generateId";

@Injectable()
export class UsersService {
  constructor(@InjectModel("User") private readonly users: Model<User>) {}

  async create(email: string, password: string, username: string): Promise<User> {
    return this.users.create({
      display_name: username,
      email,
      password: await bcrypt.hash(password, 10),
      uid: await generateId(8),
      username
    });
  }

  async findOne(query: FilterQuery<User>): Promise<User | null> {
    return this.users.findOne({ ...query, deleted: false });
  }

  exists(query: FilterQuery<User>): Promise<boolean> {
    return this.users.exists(query);
  }

  async search(query: FilterQuery<PartialUser>): Promise<PartialUser | null> {
    return this.users.findOne(query, "-activated -email -username");
  }
}
