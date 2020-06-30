import { Request } from "express";

import { ISession } from "~/server/interfaces/session.interface";

import { User } from "~server/modules/users/interfaces/user.interface";

export interface IRequest extends Request {
  session?: ISession;
  user: User | null;
}
