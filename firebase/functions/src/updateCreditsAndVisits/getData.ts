import * as functions from 'firebase-functions';
import {firestore} from "firebase-admin";

export function GetUser(uid : string){
                
    return firestore
   .collection("users")
   .where("calendarID", "==", uid.toString())
   .get();
         

 }


 export function GetOperation(oid : string){

    var op;
    return op;



}
