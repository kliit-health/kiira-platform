import {Logger} from "./logging";
import functions = require("firebase-functions");

type FirebaseFunctionModule = typeof functions

export interface Context {
  functions: FirebaseFunctionModule,
  logger: Logger
}
