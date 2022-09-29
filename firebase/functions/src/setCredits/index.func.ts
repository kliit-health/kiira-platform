// import * as updateData from './updateData';
import {Context} from "../ioc";


module.exports = (context: Context) => {
  return context.functions.https.onRequest(async (req, res) => {
    /*
            const {
                userId,
                creditInfo:{
                    credits:creditValue,
                    visits:visitValue,
                }
            } = req.body;

            await updateData.setUser(userId,{creditValue,visitValue});*/
    res.sendStatus(200);
  });
};
