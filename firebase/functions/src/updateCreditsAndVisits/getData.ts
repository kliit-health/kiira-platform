import * as functions from 'firebase-functions';
import {firestore} from "firebase-admin";

export async function GetUser(u_id : string){
      
    return firestore
   .collection("users")
   .where("uid", "==", u_id)
   .get();
         

 }


 export async function GetAppointment(a_id : string){

  return firestore
  .collection("appointments")
  .where("id", "==", a_id)
  .get();



}
