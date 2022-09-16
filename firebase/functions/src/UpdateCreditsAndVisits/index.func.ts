
import * as kiira from "./kiira";
import * as functions from 'firebase-functions';
import * as updateUser from "./updateUser";
import * as toCamelCase from "./toCamelCase";

//Where is the update user function
//Where is he update subscription function


module.exports = (userID : string , actionID : string ) => {

    //functions.https.onCall(async ({subscriptionInfo}, response) => {

        var user;//Get user from ID
        var action;//Get action from ID

        

        //if we are adding a subscription 
        if(true) await AddSubscriptionToUser(metadata);

        //if we are cancelling a subscription 
        else await RemoveSubscriptionFromUser(metadata);

    }

    
    function AddSubscriptionToUser (metadata : string)  {
        
        //calculate the desired visitor number
        //calculate the desired credits number
        await updateUser(metadata.uid, {
            //visits,
            //credit
        })
        
        //return response.send(details).status(200)
        
    }

    function RemoveSubscriptionFromUser (metadata : string) {

        //calculate the desired visitor number
        //calculate the desired credits number
        await updateUser(metadata.uid, {
            //visits,
            //credits
        })
        
      //  return response.send(details).status(200)

    
    
    
    
    }


    function GetUser(uid : string){




    }