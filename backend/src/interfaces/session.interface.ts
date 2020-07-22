export interface ISession extends Express.Session {
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
