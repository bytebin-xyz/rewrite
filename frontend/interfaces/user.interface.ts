export interface User {
  avatar: string | null;
  displayName: string;
  email: string;
  username: string;

  readonly activated: boolean;
  readonly createdAt: Date;
  readonly deleted: boolean;
  readonly expiresAt: Date;
  readonly id: string;
  readonly updatedAt: Date;
}
