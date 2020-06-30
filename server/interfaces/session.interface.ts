export interface ISession extends Express.Session {
  lastUsed?: Date;
  uid?: string;
  userAgent?: string;
}
