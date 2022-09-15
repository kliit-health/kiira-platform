import {app} from "firebase-admin";
import App = app.App;

export interface Context {
  admin: App,
  functions: unknown,
  environment: string
}
