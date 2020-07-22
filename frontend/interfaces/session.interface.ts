export interface Session {
  identifier: string;
  ip: string | null;
  isCurrent: boolean;
  lastUsed: string;
  ua: {
    browser: {
      name?: string;
      major?: string;
      version?: string;
    };
    device: {
      model?: string;
      type?: string;
      vendor?: string;
    };
    os: {
      name?: string;
      version?: string;
    };
  };
  uid: string;
}
