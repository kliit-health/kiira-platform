
//import * as functions from 'firebase-functions';
import * as updateData from './updateData';
import * as getData from './getData';


//Where is the update user function
//Where is he update subscription function


export = async(userID : string , operationID : string ) => {

    //functions.https.onCall(async ({subscriptionInfo}, response) => {


        const userAndOpData = await GetUserAndOperation(userID,operationID);

        //Extract relevent values from operation
        const user = userAndOpData[0];
        const operation = userAndOpData[1];
        

        const valuesToAdd = {

            updatedVisits : 0,
            updatedCredits : 0,
        };
        
        //Determine if the operation involves adding or subtracting
        ProcessValuesToAdd(operation,valuesToAdd);


        updateData.UpdateUser(user);
}


    const GetUserAndOperation = async(userID : string , operationID : string ) => {
        //async
        const user = getData.GetUser(userID);

        //async
        const action = getData.GetOperation(operationID)

        const userOperationData = await Promise.all([user,action]);
            return userOperationData;
    }
    
    const ProcessValuesToAdd = (operation : any, values: UpdateValues) => {
        
    //return response.send(details).status(200)
        
    }





