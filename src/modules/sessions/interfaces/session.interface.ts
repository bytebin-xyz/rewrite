import { ISessionData } from "./session-data.interface";

export interface ISession {
  _id: string;
  expires: Date;
  session: ISessionData;
}
