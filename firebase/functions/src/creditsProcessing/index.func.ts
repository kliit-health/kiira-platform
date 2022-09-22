import * as updateData from "./updateData";
import * as processData from "./processData";
import {Context} from "../ioc";


module.exports.AddCredits = (context : Context) => {
    context.functions.https.onCall(async (data, context) => {
        const {
            userId,
            transactionInfo: {
                type: aType,
                id: aId,
            },
        } = data;

        await processData.processCreditsAndVisits(userId, aType, aId, "Credit");
    });
};

module.exports.RemoveCredits = (context : Context) => {
    context.functions.https.onCall(async (data, context) => {
        const {
            userId,
            transactionInfo: {
                type: aType,
                id: aId,
            },
        } = data;

        await processData.processCreditsAndVisits(userId, aType, aId, "Debit");
    });
};


module.exports.SetCredits = (context : Context) => {
    context.functions.https.onCall(async (data, context) => {
        const {
            userId,
            credits,
        } = data;

        await updateData.setUser(
            userId,
            {
                updatedCredits: credits,
                updatedVisits: credits,
            });
    });
};

