import { ClientLocationList } from "./OfferInfo";

export class OnBoardingInfo {

    ClientList: ClientList[];
    ClientContactList: ClientContactList[];
    ClientContractList: ClientContractList[];
    RecruiterList: RecruiterList[];
}

export class OnEmploymentInfo {
    ClientList: ClientList[];
    ClientContactList: ClientContactList[];
    ClientContractList: ClientContractList[];
    ClientLocationList: ClientLocationList[];
    ClientReportingLocationList : ClientLocationList[];
    ClientCityList : any[];
    EmploymentTypeList : any[];
    CountryList : any[];
    StateList : any;
    PayGroupList? : any[];
    IndustryList? :  any[]  ; 

}
export class ClientList {

    Id?: number;
    Name?: string;
    industryId? : any;

}

export class ClientContactList {

    Id: number;
    ClientId: number;
    Name: string | String;
    PrimaryMobileCountryCode: string;
    PrimaryMobile: string;
    PrimaryEmail: string;

}

export class ClientContractList {

    Id: number;
    ClientId: number;
    Name: string | String;
    IsRateCardModel : boolean;
    IsEducationalDocumentRequired : boolean;
    IsWorkExperienceDocumentRequired : boolean;
    DefaultTenureType? : any;
    DefaultEmploymentType? : any;
    DefaultPayStructureId? :any;
    DefaultSalaryType? :  any;

}


export class MandatesAssignment {

    Id: number;
    Name: string;

}

export class RecruiterList {

    UserId: number;
    Name: string | String;

}




export class ExternalCandidateInfo {
    CandidateId: number;
    Name: string;
    Gender: number;
    Nationality: number;
    DateOfBirth?: Date;
    PrimaryMobile: string;
    PrimaryMobileCountryCode: string;
    PrimaryEmail: string;
}


export const _ClientList: ClientList = {
    Id: 0,
    Name: "",

};


export const _ClientContactList: ClientContactList = {
    Id: 0,
    ClientId: 0,
    Name: "",
    PrimaryMobileCountryCode: "",
    PrimaryMobile: "",
    PrimaryEmail: ""

};

export class OnboardingAdditionalInfo {
    LstEmployeeDivision: any[] = [];
    LstEmployeeDepartment: any[] = [];
    LstEmployeeDesignation: any[] = [];
    LstEmployeeLevel: any[] = [];
    LstEmployeeCategory: any[] = [];
    LstReligion: any[] = [];
    LstSubEmploymentType: any[] = [];
    LstSubEmploymentCategory: any[] = [];
    LstCostCityCenter: any[] = [];
    LstBuildings : any[] = [];
    LstJobProfile : any[]= [];
    LstClientZone: any[] = [];
  
  }

  export class AdditionalColumns {
    MarriageDate : Date;
    Religion : number;
    Department? : number;
    JobProfile : number;
    SubEmploymentType : number;  
    Division? : number;
    Level : number ;
    SubEmploymentCategory : number;
    CostCityCenter : number;
    Building : number;
    EmploymentZone : number;
  }