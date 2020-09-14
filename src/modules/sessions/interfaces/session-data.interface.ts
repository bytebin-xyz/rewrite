export interface ISessionData extends Express.SessionData {
  identifier: string;

  ip: string | null;

  lastUsed: Date;

  ua: {
    browser: IUAParser.IBrowser;
    device: IUAParser.IDevice;
    os: IUAParser.IOS;
  };

  uid: string;
}
