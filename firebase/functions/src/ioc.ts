import {Logger} from "./logging";
import {firestore} from "firebase-admin";
import {AcuityClient} from "./di/acuity";
import functions = require("firebase-functions");
import Firestore = firestore.Firestore;
import {KiiraFirestore} from "./di/kiiraFirestore";

type FirebaseFunctionModule = typeof functions;

export interface Context {
  functions: FirebaseFunctionModule,
  firestore: Firestore,
  logger: Logger,
  acuity(): AcuityClient,
  kiiraFirestore(): KiiraFirestore
}
