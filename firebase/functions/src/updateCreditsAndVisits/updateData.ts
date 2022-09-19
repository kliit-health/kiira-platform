import * as getData from './getData';

export async function UpdateUserWithValues (uid : string, values : UpdateValues) {

        const user = await getData.GetUser(uid);
        UpdateUser(user);

        
    }


    async function UpdateUser(user : any){



    }