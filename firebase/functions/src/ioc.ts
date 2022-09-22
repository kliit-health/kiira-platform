import {Logger} from "./logging";
import functions = require("firebase-functions");
import {firestore} from "firebase-admin";
import Firestore = firestore.Firestore;

type FirebaseFunctionModule = typeof functions;

export interface Context {
  functions: FirebaseFunctionModule,
  firestore: Firestore,
  logger: Logger
}
