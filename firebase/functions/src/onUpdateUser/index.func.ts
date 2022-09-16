
import * as kiira from "./kiira";
import * as functions from "./firebase-functions";
import * as updateUser from "./updateUser";
import * as toCamelCase from "./updateUser";

//Where is the update user function
//Where is he update subscription function


/* firebaseFetch = require('../utils/f unctions/firebaseSingleFetch')
const updateSubscription = require('../utils/functions/updateSubscription')
const toCamelCase = require('../utils/functions/toCamelCase')
const functions = require('firebase-functions')
const updateSubscription = require('../utils/functions/updateSubscription')
const updateUser = require(
const ERROR = require('../constants/error_codes')*/

module.exports = () => {

    //functions.https.onCall(async ({subscriptionInfo}, response) => {

        const {
            id,
            status,
            credits,
            customer,
            metadata
        } 
        = subscriptionInfo;


        //if we are adding a subscription 
        if(true) await AddSubscriptionToUser();

        //if we are cancelling a subscription 
        else await RemoveSubscriptionFromUser();

    }

    
    function AddSubscriptionToUser ()  {
        
        //calculate the desired visitor number
        //calculate the desired credits number
        await updateUser(metadata.uid, {
            visits,
            creditshow to p
        })
        
        return response.send(details).status(200)
        
    }

    function RemoveSubscriptionFromUser () {

        //calculate the desired visitor number
        //calculate the desired credits number
        await updateUser(metadata.uid, {
            visits,
            credits
        })
        
        return response.send(details).status(200)

    }
