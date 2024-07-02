import { ClientContractOperations } from "../Client/ClientContractOperations";

export class MigrationInfo {

    Id: number;
    code: string;
    PayCycleDetails: string;
    ManagerList: ManagerList[];
    LeaveGroupList: LeaveGroupList[];
    CostCodeList: CostCodeList[]
    PayPeriodList : PayPeriodList[];
    PaygroupProductOverridesList: [];
    ClientContractOperationList : any;
    NoticePeriodDaysList : any[];
    ClientLocationList? :[];
    DefaultIndustryId? : number;
 
}

export class OnboardingOperationalConfigurationInfo {
  ClientContractOperations : ClientContractOperations;
  OperationalFieldsConfiguration : any[];
  LstLanguage : any[];
  EducationDocumentTypes : any[];
  WorkExperienceDocumentTypes : any[];
  LstReligion : any[];
}

export class ManagerList {
    ManagerId: number;
    ManagerName: string;

}

export class LeaveGroupList {
    Code: string;
    Name: string;
    Id : number;

}

export class CostCodeList {
    Id: number;
    CostCodeId: number;
    CostCodeName: string;
}

export class PayPeriodList {
    Id: number;
    PaycycleId: number;
    PayCyclePeriodName: string;
}