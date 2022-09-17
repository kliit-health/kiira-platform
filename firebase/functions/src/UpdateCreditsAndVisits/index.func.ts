
//import * as functions from 'firebase-functions';
import * as updateData from './updateData';
import * as getData from './getData';


//Where is the update user function
//Where is he update subscription function


export = (userID : string , operationID : string ) => {

    //functions.https.onCall(async ({subscriptionInfo}, response) => {

        //async
        var user = getData.GetUser(userID);

        //async
        var action = getData.GetOperation(operationID);

        //Extract relevent values from operation
        var creditsToAdd : Number = 0;
        var visitsToAdd : Number = 0;




        //Determine if the operation involves adding or subtracting
        //if we are adding 
        if(true) AddSubscriptionToUser(creditsToAdd,visitsToAdd);

        //if we are cancelling  
        else RemoveSubscriptionFromUser(creditsToAdd,visitsToAdd);

        //
        updateData.UpdateUser();
    }

    
    function Update (credits : Number,visits : Number,)  {
        
        //calculate the desired visitor number

        
        
        //return response.send(details).status(200)
        
    }

    function RemoveFromUser (credits : Number,visits : Number,) {

        //calculate the desired visitor number

        await updateData.UpdateOperation();

      //  return response.send(details).status(200)

    
    
    
    
    }




