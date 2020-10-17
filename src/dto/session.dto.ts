import { Exclude } from "class-transformer";

import { Session } from "@/interfaces/session.interface";

export class SessionDto implements Session {
  @Exclude()
  cookie!: Express.SessionCookieData;

  isCurrent!: boolean;

  uid!: string;
}
