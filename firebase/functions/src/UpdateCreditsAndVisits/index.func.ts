
import * as updateData from './updateData';
import * as getData from './getData';
import { Context } from '../ioc';


//Where is the update user function
//Where is he update subscription function

module.exports = (context : Context) => {
    
    return context.functions.https.onRequest(async (req,res) => {

        const {
            userId,
            appointmentId,
            operationId
        } = req.body;

        await processCreditsAndVisits(userId,appointmentId,operationId);
        res.sendStatus(200);
    })}


async function processCreditsAndVisits(userId: string, appointmentId: string, operationId: string) {
        // {

        //Extract relevent values from operation
        //const appointment = await getData.getAppointment(appointmentId);
        
        
        //console.log(appointment.docs[0].data());
        const userVal = await getData.getUserValues(userId);
        const appointmentVal = await getData.getAppointmentValues(appointmentId);
        


        //Determine if the operation involves adding or subtracting
        const valuesToAdd = await ProcessValuesToAdd(userVal,appointmentVal ,operationId);

        console.log("Appointment visits are now " + valuesToAdd.updatedVisits);

        await updateData.setUser(userId, valuesToAdd);
 
    }


    async function ProcessValuesToAdd (userValues : UpdateValues, appointmentValues : UpdateValues, operationId : string) : Promise<UpdateValues>{
        
        let valuesSign = await getData.getOperationFromId(operationId);
        console.log(`adding user credit ${userValues.updatedCredits} to appoinmet credits ${appointmentValues.updatedCredits*valuesSign}`);
        return {

            updatedCredits : userValues.updatedCredits + appointmentValues.updatedCredits * valuesSign,
            updatedVisits :  userValues.updatedVisits + appointmentValues.updatedVisits * valuesSign

        };
    }



