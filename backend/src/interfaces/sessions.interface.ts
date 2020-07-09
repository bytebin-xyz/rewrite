import { ISession } from "./session.interface";

export interface ISessions extends ISession {
  current: boolean;
}
