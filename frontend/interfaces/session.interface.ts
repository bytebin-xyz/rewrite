export interface Session {
  current?: boolean;
  identifier?: string;
  lastUsed?: Date;
  ua?: {
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
  uid?: string;
}
