import { Request as ExpressRequest } from "express";

import { Session } from "./session.interface";

import { User } from "@/modules/users/schemas/user.schema";

export interface Request extends ExpressRequest {
  session: Session & Express.Session;
  user: (User & { [key: string]: any }) | null;
}
