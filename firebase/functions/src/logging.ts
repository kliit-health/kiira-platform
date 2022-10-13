export interface Logger {
  info(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}
