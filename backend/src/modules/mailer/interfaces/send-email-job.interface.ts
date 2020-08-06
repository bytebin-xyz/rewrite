export interface SendEmailJob {
  data: Record<string, unknown>;
  displayName: string;
  to: string;
}
