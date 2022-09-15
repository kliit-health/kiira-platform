import {Logger} from "./logging";
import {FunctionBuilder} from "firebase-functions";

export interface Context {
  functions: FunctionBuilder,
  logger: Logger
}
