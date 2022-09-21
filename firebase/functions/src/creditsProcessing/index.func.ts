
import * as updateData from './updateData';
import * as getData from './getData';
import * as types from './types';
import { Context } from '../ioc';


module.exports = (context : Context) => {
    
    return context.functions.https.onCall(async (req,res) => {

        const {
            userId,
            transactionInfo:{
                type:aType,
                id:aId,
                op:op
            }
        } = req.body;

        await processCreditsAndVisits(userId,aType,aId,op);
        //res.sendStatus(200);
    })}


async function processCreditsAndVisits(userId: string, appTypeRaw : string, appIdRaw: string, operationIdRaw: string) {        

        const userVal = await getData.getUserValues(userId);  

        const appointmentType : types.AppointmentTypes = types.AppointmentTypes[appTypeRaw as keyof typeof types.AppointmentTypes];
        
        const appointmentVal = await getData.GetAppointmentValuesFromType(appointmentType, appIdRaw);   


        //Determine if the operation involves adding or subtracting
        const valuesToAdd = await processValuesToAdd(userVal, appointmentVal, operationIdRaw);

        await updateData.setUser(userId, valuesToAdd);
 
    }

    async function processValuesToAdd (userValues : types.UpdateValues, appointmentValues : types.UpdateValues, operationId : string) : Promise<types.UpdateValues>{
        
        let valuesSign = await getData.getOperationFromId(operationId);
        //console.log(`adding user credit ${userValues.updatedCredits} to appoinmet credits ${appointmentValues.updatedCredits*valuesSign}`);
        let finalCredits = userValues.updatedCredits + appointmentValues.updatedCredits * valuesSign;
        if(finalCredits < 0){finalCredits = 0;}

        let finalVisits = userValues.updatedVisits + appointmentValues.updatedVisits * valuesSign;
        if(finalVisits < 0){finalVisits = 0;}

        return {

            updatedCredits : finalCredits,
            updatedVisits :  finalVisits

        };
    }



