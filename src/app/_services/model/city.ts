import { Statutory, _Statutory } from './statutory';
export class Cities {

    Id: number;
    Name: string;
    Code: string;
    CountryId: number;
    StateId: number;
    ListOfCity: string;
    ListOfDistrict: string;
    Status: number;
    IsMetro:number;
    LstStatutoryDetails: Statutory[];
    Modetype: number;
}

export const _Cities: Cities = {
    Id: 0,
    Name: "",
    Code: "",
    CountryId: 0,
    StateId:0,
    ListOfCity: null,
    ListOfDistrict: null,
    Status: 0,
    IsMetro:0,
    LstStatutoryDetails: null,
    Modetype: 0
};

