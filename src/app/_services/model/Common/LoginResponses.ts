import { BaseModel } from './BaseModel';
import { BrowserDetails } from './Authentication';
import { GeoLocation } from './Authentication';
import { UserInterfaceControls } from '../UserInterfaceControls';

// export class SessionDetails {
//     UserId: string;
//     PersonId: string;
//     PersonName: string;
//     Token: string;
//     API_Endpoints: string;
//     TokenType: string;
//     AccessToken: string;
//     LocalSessionDetails: string;
// }
export class ClientBase extends BaseModel {

    //Id: number;
    Code: string;
    Name: string;
    OrganizationId: number;
    CompanyId: number;
    IsDefault: boolean;
    ClientLogoURL: any;
    LoginCode?: string;

}


export interface ClientContractBase extends BaseModel {
    //Id: number;
    Code: string;
    Name: string;
    ClientId: number;
}
export class LoginResponses {

    Company: Company;
    Token: string;
    UserSession: UserSession;
    UserDetails: UserDetails;
    Implementation: Implementation;
    ImplementationCompany: ImplementationCompany;
    ModuleId: number;
    UserCompanyAppliationRoles: UserCompanyAppliationRole[];
    ImplementationId: number;
    ImplementationCompanyId: number;
    EmployeeId: number;
    ClientList: ClientBase[];
    ClientContractList: ClientContractBase[];
    CompanyLogoLink: string;
    ClientLogoLink: string;
    LastLoggedInAt: Date | string;
    LastPwdUpdatedOn: Date | string;
    IsSystemAdmin: boolean;
    UIRoles: Roles[];
    Status: boolean;
    Key: string;
    Vector: string;
    UIRolesCopy?: Roles[];
}

// export class BaseModel {
//     Id: number;

//     CreatedOn: Date | string;

//     LastUpdatedOn: Date | string;

//     CreatedBy: string;

//     LastUpdatedBy: string;

// }

/** 
 * Authenticates the user.
  * @return The user session details of Company.
 */

export class Company extends BaseModel {

    Code: string;
    Name: string;
    Description: string;
    IsActive: boolean;
    OrganizationDetails: Organization;
    IsDefault: boolean;
    OrganizationId: number;
    LstCompanyModule: CompanyModule[];
    LstCompanyBusinessTypeMapping: CompanyBusinessTypeMapping[];
}

/** 
 * Authenticates the user.
  * @return The user session details of UserSession.
 */

export class UserSession {

    Token: string;
    UserId: number;
    PersonId: number;
    PersonName: string;
    CreatedOn: Date | string;
    LastCheckedOn: Date | string;
    IPAddress: string;
    RouterPublicIP: string;
    RouterPrivateIP: string;
    IMEI: string;
    BrowserDetails: BrowserDetails;
    LocationDetails: GeoLocation;
    LocationJson: string;
    BrowserJson: string;
    MobileNumber: string;
    EmailId: string;
    UserType: string;
    Id: number;

}

/** 
 * Authenticates the user.
  * @return The user details of authentication.
 */
export class BaseUserDetails {

    UserId: number;
    Name: string;
}

export class UserDetails extends BaseUserDetails {

    PersonId: number;
    UserName: string;
    Password: string;
    MobileNo: string;
    EmailId: string;
    SystemUserCode: string;
    OtherUserCode: string;
    AuthenticationConfigurationId: number;
    UserType: UserType;
    Status: UserStatus;
    LastLoggedInAt: Date | string;
    WrongAttempts: number;
    IsLocked: boolean;
    LockedOn: Date | string;
    CreatedOn: Date | string;
    LastUpdatedOn: Date | string;
    CreatedBy: string;
    LastUpdatedBy: string;
    IsMFAEnabledForWeb: boolean;
    IsMFAEnabledForMobile: boolean;

}



export enum UserStatus {

    InActive,
    Active
}

export enum UserType {

    Any,
    Employee,
    ClientUser,
    CompanyUser,
    CoreUser
}

/** 
 * Authenticates the user.
  * @return The user implementation of Auth.
 */
export class Implementation extends BaseModel {

    // Id: number;
    Code: string;
    Name: string;
    Decription: string;
    //public long ApplicationId
    Application: Application;
    Company: Company;
    Country: Country;
    Properties: { [key: string]: any };
    //Properties: string;

}

export class Application extends BaseModel {

    Code: string;
    Name: string;
    Description: string;
    IsActive: boolean;
    VersionList: ApplicationVersion[];
    LstModule: Module[];

}


export class ApplicationVersion extends BaseModel {
    //Id: number;
    Version: string;
    ReleaseDate: Date | string;
    Properties: { [key: string]: any };
    ApplicableCountryList: Country[];
    ApplicableCompanyList: Company[];
    ApplicableImplementationList: Implementation[];
}

export class Module extends BaseModel {

    Code: string;
    Name: string;
    Description: string;
    Status: number;
    ApplicationId: number;
}

export class Organization extends BaseModel {

    Code: string;
    SectorType: number;
    ParentId: number;

}
export class Country extends BaseModel {
    Code: string;
    Name: string;
}

export class CompanyModule {

    Id: number;
    ModuleId: number;
    CompanyId: number;
    Module: Module;
}

export class CompanyBusinessTypeMapping {

    Id: number;
    CompanyId: number;
    BusinessType: number;
}


export class ImplementationCompany extends BaseModel {

    //[DBColumnName(DaConstants.CORE_COL_ID, IsIdentity = true)]
    //Id: number;

    ImplementationId: number;
    CompanyId: number;
    BOPath: string;
    Properties: { [key: string]: any };

}

export enum RoleType {

    Integrum,
    Employee,
    Client,
    Company,
    Candidate
}

// export class Company extends BaseModel
// {

//     Code: string;

//     Name: string;

//     Description: string;

//     IsActive: boolean;
//     OrganizationDetails: Organization;

//     IsDefault: boolean;     

//     OrganizationId: number;

//     LstCompanyModule: CompanyModule[];
// }

export class UserCompanyAppliationRole {

    Id: number;
    UserId: number;
    CompanyApplicationRoleId: number;
    CompanyId: number;
    CompanyApplicationRole: CompanyApplicationRole;
    Modetype: UIMode;
    Status: number;

}

export class Roles {

    Role: Role;
    AccessControls: AccessControl;
    UserInterfaceControls: UserInterfaceControls;
    WebMenuItemList: WebMenuItemList[]

}

export class WebMenuItemList {
    ChildMenuItems: WebMenuItemList[];
    DisplayOrder: number;
    Icon: string | null;
    MenuName: string;
    Route: string;
    TargetType: WebMenuItemTargetType;
    Type: WebMenuItemType;
    IsVisible : boolean;
}

export enum WebMenuItemType { Internal = 0, External = 1 } 
export enum WebMenuItemTargetType { Self = 0, NewTab = 1, NewWindow = 2 }

export class CompanyApplicationRole {
    Id: number;

    Properties: string;

    CompanyId: number;

    RoleId: number;

    Status: number;

    Role: Role;

    CompanyModuleRoles: CompanyModuleRole[];

}

export class Role extends BaseModel {

    Code: string;

    Name: string;

    Roletype: RoleType;

    Description: string;

    Status: number;

}


export class UserHierarchyRole {
    IsCompanyHierarchy: boolean;
    AttributeId?: number;
    AttributeName?: string;
    AttributeValueId?: number;
    AttributeValueName?: string;
    AttributeValuePropertyId?: number;
    AttributeValuePropertyName?: string;
    RoleCode: string;
    RoleId: number;
}


export class CompanyModuleRole {
    Id: number;

    CompanyModuleId: number;

    CompanyApplicationRoleId: number;

    DisplayName: string;

    CompanyModule: CompanyModule;

    CompanyRoleProfileMappings: CompanyRoleProfileMapping[];
    Modetype: UIMode;
}

export class CompanyRoleProfileMapping {
    Id: number;

    CompanyModuleRoleId: number;

    CompanyModuleProfileId: number;

    IsOverride: number;

    ClientId: number;

    ClientContractId: number;

    Modetype: UIMode;
    CompanyModuleProfile: CompanyModuleProfile;

}

export enum UIMode {
    None = 0,
    Edit = 1,
    Delete = 2
}

export class CompanyModuleProfile {
    Id: number;

    CompanyModuleId: number;

    ProfileId: number;

    DisplayName: string;

    Profile: Profile;

    CompanyModule: CompanyModule;
    ProfileAccessControlLst: ProfileAccessControl[];

}

export class Profile extends BaseModel {
    Code: string;

    Name: string;

    Description: string;

    Status: number;


}

export class ProfileAccessControl {
    Id: number;

    CompanyModuleProfileId: number;

    AccessControlGroupId: number;

    AccessControlId: number;

    IsOverride: boolean;

    Properties: string;

    DisplayName: string;

    Class: string;

    Query: string;

    Modetype: UIMode;
    AccessControlGroup: AccessControlGroup;

    AccessControl: AccessControl;


}

export class AccessControlGroup extends BaseModel {
    Code: string;

    Description: string;

    GroupAccessControlMappings: GroupAccessControlMapping[];
    LstAccessControl: AccessControl[];
}

export class GroupAccessControlMapping {
    Id: number;

    AccessControlGroupId: number;

    AccessControlId: number;

    AccessControlTypePropertyId: number;

    Value: string;

    Modetype: UIMode;

    AccessControlPropertyTypeId: AccessControlPropertyType;
}

export enum AccessControlPropertyType {
    Properties,
    Permission
}



export class AccessControlTypeProperties extends BaseModel {
    Code: string;

    Description: string;

    AccessControlTypeId: number;

    Modetype: UIMode;

    AccessControlPropertyTypeId: AccessControlPropertyType;

}

export class AccessControlPropertyvalue {
    Id: number;

    AccessControlId: number;

    AccessControlTypePropertyId: number;

    value: string;

    AccessControlPropertyTypeId: AccessControlPropertyType;
    AccessControlTypeProperties: AccessControlTypeProperties;
    Modetype: UIMode;
}

export class AccessControlType {

    Id: number;
    Code: string;
    Description: string;
    LstPermission: AccessControlTypeProperties[];
    LstProperties: AccessControlTypeProperties[];

}

export class ChildAccessControls extends BaseModel {

    Code: string;
    AccessControlTypeId: number;
    ControlName: string;
    ParentId: number;
    Properties: AccessControlPropertyvalue[];
    Permissions: AccessControlPropertyvalue[];
    AccessControlType: AccessControlType;

}

export class AccessControl extends BaseModel {

    Code: string;
    AccessControlTypeId: number;
    ControlName: string;
    ParentId: number;
    Properties: AccessControlPropertyvalue[];
    Permissions: AccessControlPropertyvalue[];
    AccessControlType: AccessControlType;
    ChildAccessControls: ChildAccessControls;
    DisplayOrder: number;
}
