import { UIMode, BaseModel } from "../Common/BaseModel";
import { ClientContact } from "./ClientContact";
import { ClientContract } from "./ClientContract";

export class ClientDetails {
    Id: number;
    OrganizationId: number;
    CompanyId: number;
    Code: string;
    Name: string;
    Status: number;
    Notes: string;
    DefaultAccountManagerId: number;
    LstAdditionalClientDetails: [];
    Shared: number;
    LstClientLocation: ClientLocation[];
    LstContact: ClientContact[];
    LstContract: ClientContract[];
    ClientBase: ClientBase;
    Modetype: UIMode;

    CreatedOn: Date | string;
    LastUpdatedOn: Date | string;
    CreatedBy: string;
    LastUpdatedBy: string;
    ShortCode: string;
    Website: string;
    IndustryId: number;
    Isnapbased: number;

}

export class ClientBase extends BaseModel {
    Code: string;
    Name: string;
    OrganizationId: number;
    CompanyId: number;
    LoginCode: string;
    ClientLogoURL: string;
    IsDefault: boolean;
}

export class ClientLocation extends BaseModel {
    ClientID: number;

    LocationCode: string;

    LocationName: string;

    LocationType: LocationType;

    IsPrimaryLocation: boolean;

    // AddressDetails: string;
    ClientLocationAddressdetails: any;// AddressDetails;

    IsBillingAddress: boolean;

    IsShippingAddress: boolean;

    GSTNumber: string;

    //  AdditionalLocationDetails: string;
    LstAdditionalLocationDetails: [];

    Status: number;
    //LstContact: ClientContact[];
    Modetype: UIMode;
}

export enum LocationType {
    WorkPremise = 1,
    ClientLocation = 2,
    Both = 3

}

export class ClientModel {
    newobj: ClientDetails;
    oldobj: ClientDetails;

}