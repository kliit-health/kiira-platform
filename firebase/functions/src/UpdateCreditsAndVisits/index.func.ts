
//import * as functions from 'firebase-functions';
import * as updateData from './updateData';
import * as getData from './getData';


//Where is the update user function
//Where is he update subscription function


export async function UpdateCreditsAndVisitsFrom(userID : string , appointmentID : string ) {

    //functions.https.onCall(async ({subscriptionInfo}, response) => {


        //Extract relevent values from operation
        const appointment = await getData.GetAppointment(appointmentID);
        
        const valuesToAdd = {

            updatedVisits : 0,
            updatedCredits : 0,
        };
        
        //Determine if the operation involves adding or subtracting
        ProcessValuesToAdd(appointment,valuesToAdd);


        updateData.UpdateUserWithValues(userID,valuesToAdd);
}


    
    function ProcessValuesToAdd (operation : any, values: UpdateValues){
        
        const visits = operation.visits;
        const credits = operation.appointmentType.credits;

        let addingValues : Boolean = false;
        let valuesSign : OperationSign = addingValues == true? 1 : -1;

        values.updatedVisits = visits * valuesSign;
        values.updatedCredits = credits * valuesSign;
        
    //return response.send(details).status(200)
        
    }


