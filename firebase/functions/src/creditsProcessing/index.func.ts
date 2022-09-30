import * as types from "./types";
import {OperationType} from "./types";
import {Context} from "../ioc";
import {enumeration} from "purify-ts";
import {processCreditsAndVisits} from "./util";

module.exports = (context: Context) => {
  return context.functions.https.onCall(async (data, context) => {
    const {
      userId,
      transactionInfo: {
        type: aType,
        id: transactionId,
        op: operation,
      },
    } = data.body;

    const transactionType = types.TransactionType[aType as keyof typeof types.TransactionType];
    const opEnum = enumeration(OperationType).decode(operation).toMaybe().extract();
    if (!opEnum) {
      return {success: false, error: `Operation type ${operation} is not valid.`};
    }
    await processCreditsAndVisits(userId, transactionType, transactionId, opEnum);
    return {success: true};
    // res.sendStatus(200);
  });
};
