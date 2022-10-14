import {OperationType, TransactionType} from "./types";
import {Context} from "../ioc";
import {EitherAsync, enumeration, GetType} from "purify-ts";
import {updateCreditBalance} from "./util";
import {Interface, NonEmptyString} from "purify-ts-extra-codec";

const Request = Interface({
  userId: NonEmptyString,
  transactionInfo: Interface({
    type: enumeration(TransactionType),
    id: NonEmptyString,
    operation: enumeration(OperationType),
  }),
});

type Request = GetType<typeof Request>

module.exports = (context: Context) => context.functions.https.onRequest(async (req: any, res: any) =>
  await EitherAsync<any, void>(async ({liftEither, fromPromise}) => {
      const {userId, transactionInfo}: Request = await liftEither(Request.decode(req.body));
      const {type, id, operation} = transactionInfo;
      await fromPromise(updateCreditBalance(userId, type, id, operation));
    },
  ).caseOf({
    Right: () => res.sendStatus(200),
    Left: error => {
      context.logger.info(error);
      res.sendStatus(400);
    },
  }),
);
