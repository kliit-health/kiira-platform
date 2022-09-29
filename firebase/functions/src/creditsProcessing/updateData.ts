import * as types from './types';
import {firestore} from "firebase-admin";


export async function setUser(u_id : string, values : types.UpdateValues){
      

    const visits = values.updatedVisits;
    const credits = values.updatedCredits;

    return firestore()
   .collection("users")
   .doc(u_id)
   .set(
    {
      visits,
      credits:{
        MentalHealth : credits
      }
    },
    {merge : true}
   )     
  
  }