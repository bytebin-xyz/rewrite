import * as bcrypt from "bcrypt";

import { FilterQuery, Model } from "mongoose";

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { PartialUser, User } from "./interfaces/user.interface";

import { generateId } from "~common/utils/generateId";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel("User")
    private readonly users: Model<User>
  ) {}

  async create(email: string, password: string, username: string): Promise<User> {
    return this.users.create({
      display_name: username,
      email,
      password: await bcrypt.hash(password, 10),
      uid: await generateId(8),
      username: username.toLowerCase()
    });
  }

  async findOne(query: FilterQuery<User>): Promise<User | null> {
    const user = await this.users.findOne(query);
    return user;
  }

  exists(query: FilterQuery<User>): Promise<boolean> {
    return this.users.exists(query);
  }

  async search(query: FilterQuery<PartialUser>): Promise<PartialUser | null> {
    const user = await this.users.findOne(query, "-activated -email");
    return user;
  }

  async validate(username: string, password: string): Promise<User | null> {
    const user = await this.users.findOne({ username });
    if (user && (await user.comparePassword(password))) return user;

    return null;
  }
}
