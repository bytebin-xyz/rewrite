export interface ISession extends Express.Session {
  identifier?: string;
  lastUsed?: Date;
  ua?: {
    browser: IUAParser.IBrowser;
    device: IUAParser.IDevice;
    os: IUAParser.IOS;
  };
  uid?: string;
}
