import {RejectionReason} from "./types";

export function reason(message: string, data?: unknown): RejectionReason {
  return {message, data};
}

class KiiraError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NoResultsError extends KiiraError {
  constructor() {
    super("");
  }
}

export function error(message: string): Error {
  return new Error(message);
}
