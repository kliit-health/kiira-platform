import { Context } from '../ioc';
//import * as creditsProcessing from '../creditsProcessing';




module.exports = (context : Context) => {
    
    return context.functions.https.onRequest(async (req,res) => {
/*
        const {
            userId,
            transactionInfo:{
                type:aType,
                id:aId,
            }
        } = req.body;

        await creditsProcessing.processCreditsAndVisits(userId,aType,aId,"Credit");*/
        //yes
        
        res.sendStatus(200);
    })
}