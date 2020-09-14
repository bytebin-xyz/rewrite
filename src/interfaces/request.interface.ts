import { Request } from "express";

import { SessionDto } from "@/modules/sessions/dto/session.dto";

import { User } from "@/modules/users/schemas/user.schema";

export interface IRequest extends Request {
  session?: Express.Session & SessionDto;
  user: (User & { [key: string]: any }) | null;
}
