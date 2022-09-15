/* eslint-disable @typescript-eslint/no-var-requires */
const admin = require("firebase-admin");
const functions = require("firebase-functions");

// initialize firebase admin
try {
  admin.initializeApp();
  admin.firestore().settings({ignoreUndefinedProperties: true});
} catch (err) {
  console.error(err);
}

// create context for dependency injection
const context = {admin, functions, environment: process.env.NODE_ENV};

function getFuncFiles() {
  const glob = require("glob");

  return glob.sync("./lib/**/*.func.js", {
    cwd: __dirname,
    ignore: ["./node_modules/**", "./src/**"],
  });
}

function getFunc(file) {
  const regex = /^.*lib\/(.+?)\/.*\.func\.js$/gm;
  return regex.exec(file)[1];
}

function exportFuncs() {
  const funcFiles = getFuncFiles();
  funcFiles.forEach(funcFile => {
    exportFunc(getFunc(funcFile), funcFile);
  });
}

function exportFunc(func, file) {
  // only export the function being called
  if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === func) {
    // execute higher-order function to allow us to pass
    // admin sdk and functions components for easier testing
    const GoogleCloudFunction = require(file);
    exports[func] = GoogleCloudFunction(context);
  }
}

exportFuncs();
