import { Statutory, _Statutory } from './statutory';
export class States {

    Id: number;
    Name: string;
    Code: string;
    CountryId: number;
    ListOfCity: string;
    ListOfDistrict: string;
    Status: number;
    LstStatutoryDetails: Statutory[];
    Modetype: number;
}

export const _States: States = {
    Id: 0,
    Name: "",
    Code: "",
    CountryId: 0,
    ListOfCity: null,
    ListOfDistrict: null,
    Status: 0,
    LstStatutoryDetails: null,
    Modetype: 0
};

