import {OperationType, TransactionType} from "./types";
import {Context} from "../ioc";
import {enumeration} from "purify-ts";
import {processCreditsAndVisits} from "./util";

module.exports = (context: Context) => {
  return context.functions.https.onRequest(async (req: any, res: any) => {
    const {
      userId,
      transactionInfo: {
        type: aType,
        id: transactionId,
        op: operation,
      },
    } = req.body;

    const transactionType = TransactionType[aType as keyof typeof TransactionType];
    const opEnum = enumeration(OperationType).decode(operation).toMaybe().extract();

    if (opEnum) {
      await processCreditsAndVisits(userId, transactionType, transactionId, opEnum);
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  });
};
