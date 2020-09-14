import { Exclude } from "class-transformer";

export class SessionDto {
  @Exclude()
  cookie!: Express.SessionCookieData;

  identifier!: string;

  ip!: string | null;

  lastUsed!: Date;

  ua!: {
    browser: IUAParser.IBrowser;
    device: IUAParser.IDevice;
    os: IUAParser.IOS;
  };

  uid!: string;
}
