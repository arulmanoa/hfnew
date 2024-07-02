import { EntityType } from "src/app/components/Models/look-up-model";

export enum CommunicationCategoryType {
    Permanent = 0,
    Present = 1,
    Official = 2,
    Personal = 3,
    Emergency = 4
}

export class CommunicationType {
    id: number;
    code: string;
    name: string;
}

export class CommunicationDetails {
    Id: number;
    CandidateId: number;
    EntityType: EntityType;
    EntityId: number;
    AddressDetails: string;
    ContactDetails: string;
    LstAddressdetails: AddressDetails[];
    LstContactDetails: ContactDetails[];
    IsEditable: boolean;
}



export class AddressDetails {
    
    CommunicationCategoryTypeId: CommunicationCategoryType;
    CountryName: string;
    StateName: string;
    City: string;
    Address1: string;
    Address2: string;
    Address3: string;
    PinCode: string;
    CountryId?:number;
    CityId?:number;
    StateId?:number;
    DistrictId?:number;
}

export class ContactDetails {
    CommunicationCategoryTypeId: CommunicationCategoryType;
    PrimaryMobile: string;
    PrimaryMobileCountryCode: string;
    AlternateMobile: string;
    AlternateMobileCountryCode: string;
    PrimaryEmail: string;
    AlternateEmail: string;
    EmergencyContactNo: string;
    LandlineStd: string;
    LandLine: string;
    LandLineExtension: string;
    PrimaryFax: string;
    AlternateFax: string;
    IsDefault: boolean;
    EmergencyContactPersonName?: string;
    EmergencyContactNoCountryCode: string;


}