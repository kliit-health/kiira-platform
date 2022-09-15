import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as glob from "glob";
import {Context} from "./ioc";
import {Logger} from "./logging";

// initialize firebase admin
const app = admin.initializeApp();
app.firestore().settings({ignoreUndefinedProperties: true});

// create context for dependency injection
const context: Context = {
  functions: functions.FunctionBuilder.prototype,
  logger: <Logger>{
    info(message: string, data?: unknown): void {
      if (data) {
        functions.logger.log(message, data);
      } else {
        functions.logger.log(message);
      }
    },
  },
};

function getFuncFiles() {
  return glob.sync("./src/**/*.func.ts", {
    cwd: __dirname,
    ignore: ["./node_modules/**"],
  });
}

function getFunc(file: string): string | null {
  const regex = /^.*src\/(.+?)\/.*\.func\.ts$/gm;
  return regex.exec(file)?.[1] ?? null;
}

function exportFuncs() {
  const funcFiles = getFuncFiles();
  funcFiles.forEach(funcFile => {
    const func = getFunc(funcFile);
    if (func) exportFunc(func, funcFile);
  });
}

function exportFunc(func: string, file: string) {
  // only export the function being called
  if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === func) {
    // execute higher-order function to allow us to pass
    // admin sdk and functions components for easier testing

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const GoogleCloudFunction = require(file);
    const googleCloudFunction = GoogleCloudFunction(context);

    exports[func] = googleCloudFunction;
  }
}

exportFuncs();
