import { UserDetails } from './UserDetails';

export class LoginSessionDetails {
    UserId: number;
    UserCode: string;
    UserName: string;
    ChildDatabaseCode?: string;
    CompanyId: number;
    CompanyName?: string;
    RoleId: number;
    IsSystemAdmin?: boolean;
    RoleName: string;
    GetConnectionBasedOnKey?: boolean;
    RoleCode: string;
    ProfileCode: string;
    ProfileName: string;
    ProfileId: number;
    clientObject?: UserDetails;
}

export const _LoginSessionDetails: LoginSessionDetails = {
    UserId: 0,
    UserCode: '',
    UserName: '',
    ChildDatabaseCode: '',
    CompanyId: 0,
    CompanyName: '',
    RoleId: 0,
    IsSystemAdmin: false,
    RoleName: '',
    GetConnectionBasedOnKey: false,
    RoleCode: '',
    ProfileCode: '',
    ProfileName: '',
    ProfileId: 0,
};

