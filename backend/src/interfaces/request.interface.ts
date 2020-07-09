import { Request } from "express";

import { ISession } from "@/interfaces/session.interface";

import { User } from "@/modules/users/schemas/user.schema";

export interface IRequest extends Request {
  session?: ISession;
  user: User | null;
}
