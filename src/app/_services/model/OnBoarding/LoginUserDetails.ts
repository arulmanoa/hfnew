import { UserCompanyAppliationRole } from "../Common/LoginResponses";
import { Person } from "../Migrations/Transition";

export class LoginUserDetails {
    Id: number;
    Person: Person;
    UserName: string;
    Password: string;
    UserCompanyAppliationRoles: UserCompanyAppliationRole[];
    UserCompanyClientMappings: UserCompanyClientMapping[];
    UserType: UserType;
    Status: UserStatus;
    IsLocked: boolean;
    LockedOn: Date | string;
    LastLoggedInAt : any;

}


export class UserCompanyClientMapping {
    Id: number;

    UserId: number;

    CompanyId: number;

    ClientId: number;

    IsActive: boolean;

    IsDefault: boolean;

    Settings: string;

    ClientContractId: number;
}

export enum UserType {
    Any,
    Employee,
    ClientUser,
    CompanyUser,
    CoreUser // sys admin
}

export enum UserStatus {
    InActive,
    Active
}