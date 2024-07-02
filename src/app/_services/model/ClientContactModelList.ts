import { UIMode } from "./UIMode";
import {BaseModel} from './Common/BaseModel'; 
import { AddressDetails } from "./Communication/CommunicationType";
import {ContactDetails} from "./Communication/CommunicationType";
export class ClientContactModelList {
    ClientContactModelList: ClientContactModelList[];
    ClientList:ClientList[];
    CountryList:CountryList[];
    StateList:StateList[];
    CityList:CityList[];
} 

export class ClientList extends BaseModel{

    Id: number;
    CompanyId:number;
    Name : string;
} 
export class CountryList extends BaseModel {

    Id: number;    
    Name : string;
    PhoneCode:string;
    
} 
export class StateList extends BaseModel{

    Id: number;
    CountryId:number;
    Name : string;
} 
export class CityList extends BaseModel{

    Id: number;
    StateId:number;
    Name : string;
} 

export class ClientLocationNameList extends BaseModel{

    Id: number;    
    LocationCode: string;
    LocationName: string;
} 

export class ClientContactModel extends BaseModel{
   // Id: number;
  ClientID: number;
  Salutation:number;
  Name:string;
  Designation:string;
  IsSinglePointOfContact:boolean;
  LstClientContact:ContactDetails;
  LstClientAddress:AddressDetails;
  LstClientContactLocationMapping: ClientContactLocationMapping[];
  Status:number;
  Modetype:UIMode;
    
}
export class ClientContactLocationMapping extends BaseModel{


    ClientContactId:number;
    ClientLocationId:number;
    Status:number;
    Modetype:UIMode;
}
