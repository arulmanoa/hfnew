import {BaseModel} from './Common/BaseModel'; 
export class Country extends BaseModel {
  
    Id: number;
    Name:string;
    CountryAbbr: string;
    StatutoryDetailsObjectData: string;
    LstStatutoryDetails: string;
    ListOfState: string
    Status: number;
    Modetype: number;
}

export const _Country: Country = {
    Id: 0,
    Name: "",
    CountryAbbr: "",
    StatutoryDetailsObjectData: "",
    LstStatutoryDetails: null,
    ListOfState: null,
    Status: 0,
    Modetype: 0
};
