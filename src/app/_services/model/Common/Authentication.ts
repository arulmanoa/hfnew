import { AuthenticationConfiguration } from './BaseModel';
import { UserType } from './BaseModel';
import { AuthenticationType } from './BaseModel';
import { BaseModel } from './BaseModel';
import { DeviceType } from './BaseModel';

export class LoginModel {

    AuthConfiguration: AuthenticationConfiguration;
    CompanyId: number;
    SSOEmailId: string;
    UserType: UserType;
    ClientId: number;
    UserName: string;
    Password: string;
    Location: GeoLocation;
    IMEI: string;
    Network: NetworkDetails;
    Browser: BrowserDetails;
    Device: DeviceDetails;
    AuthType: AuthenticationType;
    ClientCode : string;
}

export class GeoLocation {
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

export class NetworkDetails extends BaseModel {

    CompanyId: number;
    ClientId: number;
    IPAddresses: string;
    RouterPublicIPs: string;
    RouterPrivateIPs: string;
    Comments: string;
}

export class BrowserDetails {
    Id: number;
    Name: string;
    Version: string;
}

export class DeviceDetails {
    Id: number;
    Type: DeviceType;
    BrandName: string;
    Model: string;
    OSName: string;
    OSVersion: string;
}


export const _AuthenticationConfiguration: AuthenticationConfiguration = {
    Id: 0,
    KeyName: '',
    Description: '',
    CompanyId: 0,
    ClientId: 0,
    AuthType:0,
    UserType: 0,
    PermissableDeviceType: 0,
    TwoWayAuthType: 0,
    SSOProviderId: 0,
    PermissableNetworkId: 0,
    PermissableGeoLocationId: 0,
    Status: 0,
    MaxWrongAttempts:0,
    AutoUnLockMinutes: 0,
    AllowMultiBrowserLogin: false,
    AllowMultiDeviceLogin: false,
    SSOProvider: 0,
    PermissableNetwork: [],
    PermissableGeoLocation: []
};

export const _DeviceDetails: DeviceDetails = {
    Id: 0,
    Type: 0,
    BrandName: '',
    Model: '',
    OSName: '',
    OSVersion: '' 
   
};

export const _NetworkDetails: NetworkDetails = {
    Id: 0,
    CompanyId: 0,
    ClientId: 0,
    IPAddresses: '',
    RouterPublicIPs: '',
    RouterPrivateIPs: '',
    Comments: ''
}

export const _BrowserDetails: BrowserDetails = {

    Id: 0,
    Name: '',
    Version: ''
}

export const _GeoLocation: GeoLocation = {

    Id: 0,
    Latitude: 0,
    Longitude: 0,
    Radius: 0,
    RadiusDistanceIn: 0,
    Address: ''
}

