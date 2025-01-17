import {Logger} from "./logging";
import {firestore} from "firebase-admin";
import functions = require("firebase-functions");
import Firestore = firestore.Firestore;

type FirebaseFunctionModule = typeof functions;

export interface Context {
  functions: FirebaseFunctionModule,
  firestore: Firestore,
  logger: Logger
}
