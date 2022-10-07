import {OperationType, TransactionType} from "./types";
import {Context} from "../ioc";
import {EitherAsync, enumeration, GetType} from "purify-ts";
import {processCreditsAndVisits} from "./util";
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
  await EitherAsync<string, void>(async ({liftEither, throwE}) => {
      const {userId, transactionInfo}: Request = await liftEither(Request.decode(req.body));
      const {type, id, operation} = transactionInfo;
      try {
        await processCreditsAndVisits(userId, type, id, operation);
      } catch (e: unknown) {
        throwE(JSON.stringify(e));
      }
    },
  ).caseOf({
    Right: () => res.sendStatus(200),
    Left: error => {
      context.logger.info(error);
      res.sendStatus(400);
    },
  }),
);
