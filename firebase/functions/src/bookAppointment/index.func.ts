import {Context} from "../ioc";

module.exports = (context: Context) => {
  return context.functions.https.onRequest(async (req, res) => {
    res.sendStatus(200);
  });
};
