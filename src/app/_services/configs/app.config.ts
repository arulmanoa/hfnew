import { expand } from "rxjs/operators";

// SessionKeys 

export class _SessionDetails_local  {

  Company: string;
  Token: string;
  UserSession: string;
  UserDetails: string;
  Implementation: string;
  ImplementationCompany: string;
  ModuleId: string;
  UserCompanyAppliationRoles: string;
  ImplementationId: string;
  ImplementationCompanyId: string;
  ClientList: string;
  ClientContractList: string;
  CompanyLogoLink: string;
  ClientLogoLink: string;
  LastLoggedInAt:  string;
  LastPwdUpdatedOn:  string;
  IsSystemAdmin: string;
  Status: string;
  LoginResponses: string;

}
export const SessionKeys : _SessionDetails_local=   {
 
    Company: 'Company',
    Token: 'Token',
    UserSession: 'UserSession',
    UserDetails: 'UserDetails',
    Implementation: 'Implementation',
    ImplementationCompany: 'ImplementationCompany',
    ModuleId: 'ModuleId',
    UserCompanyAppliationRoles: 'UserCompanyAppliationRole',
    ImplementationId: 'ImplementationId',
    ImplementationCompanyId: 'ImplementationCompanyId',
    ClientList: 'ClientBase',
    ClientContractList: 'ClientContractBase',
    CompanyLogoLink: 'CompanyLogoLink',
    ClientLogoLink: 'ClientLogoLink',
    LastLoggedInAt: 'LastLoggedInAt',
    LastPwdUpdatedOn: 'LastPwdUpdatedOn',
    IsSystemAdmin: 'IsSystemAdmin',
    Status: 'Status',
    LoginResponses: "LoginResponses"


};


export class VerificatinLogs {
  LogKey: string;
  TenantId: string;
  VisitorRandId: number;
  Xos: string;
  Uid: string;
  Zck: string;
  AuthCode: string;
  channel: string;
  EventCode: string;
  Format: string;
  Token: string;
  Session: string;
  MfiLog : string;
}

export class LoginResponses {

  LoginResponses : _SessionDetails_local

}


export class LoginSessionDetails {
 
  Company: string;
  Token: string;
  UserSession: string;
  UserDetails: string;
  Implementation: string;
  ImplementationCompany: string;
  ModuleId: string;
  UserCompanyAppliationRoles: string;
  ImplementationId: string;
  ImplementationCompanyId: string;
  ClientList: string;
  ClientContractList: string;
  CompanyLogoLink: string;
  ClientLogoLink: string;
  LastLoggedInAt:  string;
  LastPwdUpdatedOn:  string;
  IsSystemAdmin: string;
  Status: string;
}

// export const _LoginSessionDetails: LoginSessionDetails = {
//   UserId: 0,
//   UserCode: '',
//   UserName: '',
//   ChildDatabaseCode: '',
//   CompanyId: 0,
//   CompanyName: '',
//   RoleId: 0,
//   IsSystemAdmin: false,
//   RoleName: '',
//   GetConnectionBasedOnKey: false,
//   RoleCode: '',
//   ProfileCode: '',
//   ProfileName: '',
//   ProfileId: 0,
// };



export const config = {

  StatutoryType: [
    {
      id: 1,
      name: "WCP"
    },
    {
      id: 2,
      name: "ESIC"
    },
    {
      id: 3,
      name: "LWF"
    },
    {
      id: 4,
      name: "PT"
    }
  ],
  Scales: [
    {
      id: 1,
      name: "TN_PF"
    },
    {
      id: 2,
      name: "TN_ESIC"
    },
    {
      id: 3,
      name: "TN_LWF"
    },
    {
      id: 4,
      name: "TN_PT"
    }
  ],



Months: [
  {
    id: 1,
    name: "January",
    checked: false
  },
  {
    id: 2,
    name: "February",
    checked: false
  },
  {
    id: 3,
    name: "March",
    checked: false
  },
  {
    id: 4,
    name: "April",
    checked: false
  },
  {
    id: 5,
    name: "May",
    checked: false
  },
  {
    id: 6,
    name: "June",
    checked: false
  },
  {
    id: 7,
    name: "July",
    checked: false
  },
  {
    id: 8,
    name: "August",
    checked: false
  },
  {
    id: 9,
    name: "September",
    checked: false
  },
  {
    id: 10,
    name: "October",
    checked: false
  },
  {
    id: 11,
    name: "November",
    checked: false
  },
  {
    id: 12,
    name: "December",
    checked: false
  },
]
};