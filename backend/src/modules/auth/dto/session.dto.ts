import { ISession } from "@/interfaces/session.interface";

export interface SessionDto extends ISession {
  isCurrent: boolean;
}
