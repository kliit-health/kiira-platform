
import * as updateData from './updateData';
import * as getData from './getData';
import * as types from './types';
import { Context } from '../ioc';
import * as creditsProcessing from 'firebase/app';




module.exports = (context : Context) => {
    
    return context.functions.https.onRequest(async (req,res) => {

        const {
            userId,
            transactionInfo:{
                type:aType,
                id:aId,
            }
        } = req.body;

        await creditsProcessing.processCreditsAndVisits(userId,aType,aId,"Credit");
        res.sendStatus(200);
    })
}