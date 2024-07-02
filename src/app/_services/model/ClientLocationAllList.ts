import { UIMode } from "./UIMode";
import {BaseModel} from './Common/BaseModel'; 
import { AddressDetails } from "./Communication/CommunicationType";
export class ClientLocationAllList {
    ClientLocationAllList: ClientLocationAllList[];
    ClientList:ClientList[];
    CountryList:CountryList[];
    StateList:StateList[];
    CityList:CityList[];
    DistrictList:DistrictList[];
} 

export class ClientList {

    Id: number;
    CompanyId:number;
    Name : string;
    IndustryId : any;
} 
export class CountryList {

    Id: number;    
    Name : string;
    
} 
export class StateList {

    Id: number;
    CountryId:number;
    Name : string;
} 
export class CityList {

    Id: number;
    StateId:number;
    Name : string;
} 

export class ClientLocationModel extends BaseModel{
   // Id: number;
  ClientID: string;
  LocationCode: string;
  LocationName: string;
  LocationType:number;
  IsPrimaryLocation:boolean;
  ClientLocationAddressdetails :AddressDetails;
  IsBillingAddress :boolean;
  IsShippingAddress:boolean;
  GSTNumber:string;
  LstAdditionalLocationDetails:[];
  Status: number;
  Modetype: UIMode;
    
}
export class DistrictList {

    Id: number;
    StateId:number;
    Name : string;
} 