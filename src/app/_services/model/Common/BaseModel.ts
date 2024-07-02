export class BaseModel
{
     Id: number;
    CreatedBy?:string;
    CreatedOn?:Date | any;
    LastUpdatedBy?:string;
    LastUpdatedOn?:Date | any;
}

export class AuthenticationConfiguration extends BaseModel{

    KeyName: string;
    Description: string;
    CompanyId: number;
    ClientId: number;
    AuthType: AuthenticationType;
    UserType: UserType;
    PermissableDeviceType: DeviceType;
    TwoWayAuthType: TwoWayAuthenticationType;
    SSOProviderId: number;
    PermissableNetworkId: number;
    PermissableGeoLocationId: number;
    Status: number;
    MaxWrongAttempts: number;
    AutoUnLockMinutes: number;
    AllowMultiBrowserLogin: boolean;
    AllowMultiDeviceLogin: boolean;
    SSOProvider: SingleSignOnProvider;
    PermissableNetwork: NetworkDetails[];
    PermissableGeoLocation: GeoLocation[];
    IsCaptchaRequired? : boolean;

}


export enum DeviceType {
    All,
    Mobile,
    Browser
}
    
export enum AuthenticationType {

    Forms,
    ActiveDirectory,
    SSO,
    FormsWithSSO
}

export enum SingleSignOnProvider {
    None,
    Google
}

export enum UserType {
    Any,
    Employee,
    ClientUser,
    CompanyUser,
    CoreUser        
}

export enum TwoWayAuthenticationType {
    None,
    SMS,
    Email,
    SMSAndEmail
}

export interface NetworkDetails extends BaseModel{

    CompanyId: number;
    ClientId: number;
    IPAddresses: string;
    RouterPublicIPs: string;
    RouterPrivateIPs: string;
    Comments: string;
}

export interface GeoLocation
{
    Id: number;
    Latitude: number;
    Longitude: number;
    Radius: number;
    RadiusDistanceIn: DistanceType;
    Address: string;
}

export enum DistanceType {
    Meter,
    KiloMeter
}

export class ApiResponse  {

    Message : string;
    Result :[]; 
    Status : string;
}


export enum UIMode
   {
       None,
       Edit ,
       Delete 
   }

