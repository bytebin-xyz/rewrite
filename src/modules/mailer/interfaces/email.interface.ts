export interface Email {
  html(): Promise<string> | string;
  subject(): string;
  text(): string;
}
