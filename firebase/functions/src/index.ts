import admin = require("firebase-admin");
import functions = require("firebase-functions");
import glob = require("glob");
import {Context} from "./ioc";
import {Logger} from "./logging";
import {createClient} from "./di/acuity";
import {createKiiraFirestore} from "./di/kiiraFirestore";
// initialize firebase admin
try {
  admin.initializeApp();
  admin.firestore().settings({ignoreUndefinedProperties: true});
} catch (err) {
  console.error(err);
}

// create context for dependency injection
const context: Context = {
  functions: functions,
  firestore: admin.firestore(),
  logger: <Logger>{
    info(message: string, data?: unknown): void {
      if (data) {
        functions.logger.log(message, data);
      } else {
        functions.logger.log(message);
      }
    },
    error(message: string, data?: unknown): void {
      functions.logger.error(message, data);
    },
  },
  acuity: () => createClient(),
  kiiraFirestore: () => createKiiraFirestore(admin.firestore()),
};

function getFuncFiles() {
  return glob.sync("./**/*.func.js", {
    cwd: __dirname,
  });
}

function getFunc(file: string): string | null {
  const regex = /^.*\/(.+?)\/.*\.func\.js$/gm;
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
    const gcpFunction = require(file);
    exports[func] = gcpFunction(context);
  }
}

exportFuncs();
