import { BaseModel } from "../Common/BaseModel";
import { EntitlementCalendar, EntitlementCycle, EntitlementCycleIdentifierType, HolidayType, LeaveRangeConsiderationType, OccuranceType, RoundOffMmode, UsageLimitType } from "./AttendanceEnum";
import { EntitlementRequestStatus, EntitlementUnitType } from "./EntitlementAvailmentRequest";
import { EntitlementType } from "./EntitlementType";

export interface Entitlement extends BaseModel {
    CompanyId: number;

    ClientId: number;

    ClientContractId: number;

    Code: string;

    DisplayName: string;

    Description: string;

    Type: EntitlementType;

    Status: number;
}

export interface EntitlementDefinition extends BaseModel {

    EntitlementId: number;
    //extra info for ease of querying
    EntitlementDetails: Entitlement;
    EntitlementType: EntitlementType;

    Code: string;
    DisplayName: string;

    Description: string;


    //if entitlement group entity is not there, the below is not required
    EntitlementGroupId: number;


    CompanyId: number;

    ClientId: number;

    ClientContractId: number;

    ApplicableTeamIdList: string[];
    ApplicableEmployeeIdList: string[];

    ApplicableDesignationList: string[];
    ApplicableDepartmentList: string[];
    ApplicableLevelList: string[];
    ApplicableVerticalList: string[];

    //gen


    IsAllowedToUseDuringNoticePeriod: boolean;

    AllowCarryForward: boolean;//

    IsShareable: boolean;

    RoundOffMode: RoundOffMmode;

    RoundOffValue: number;

    IsEncasheable: boolean;



    IsCreditBasedOnDOJ: boolean;

    IsCreditRequired: boolean;

    CreditCalendar: EntitlementCalendar;

    CreditCycle: EntitlementCycle;

    CreditCycleIdentifierType: EntitlementCycleIdentifierType;

    CreditCycleIdentifier: string;

    CreditUnitType: EntitlementUnitType;

    CreditUnits: number;

    CreditScale: string;//if scale based on an attribute

    CreditScaleAttribute: string;//ex. an attribute of an employee, or a month name

    CreditRuleId: number;//ex., for every 20 worked days. credit something

    IsUpfrontCredit: boolean;// if this is there, no need to considercycle identifier i think

    IncludeNewJoinerArrearPeriods: boolean;

    IsNewJoinerProrationRequired: boolean;

    //joined  befire some date ..new joiner then only credit option



    IsLapseRequired: boolean;

    LapseCalendar: EntitlementCalendar;

    LapseCycle: EntitlementCycle;

    LapseCycleIdentifierType: EntitlementCycleIdentifierType;

    LapseCycleIdentifier: string;

    LapseUnitType: EntitlementUnitType;

    LapseUnits: number;

    LapseScale: string;

    LapseScaleAttribute: string;//ex. an attribute of an employee, or a month name

    LapseRuleId: number;

    LapseAll: boolean;



    MaxBalance: number;

    MinBalance: number;



    IsPaymentRequired: boolean;

    IsAutoPaymentInititation: boolean;

    PaymentCalendar: EntitlementCalendar;

    PaymentCycle: EntitlementCycle;

    PaymentCycleIdentifierType: EntitlementCycleIdentifierType;

    PaymentCycleIdentifier: string;

    PaymentAmount: number;

    PaymentScale: string;

    PaymentScaleAttribute: string;

    PaymentRuleId: number;


    IsAttendanceProrationRequired: boolean;

    IsNegativeBalanceAllowed: boolean;

    MaxNegativeBalanceAllowed: number;

    NegativeBalanceScale: string;

    NegativeBalanceScaleAttribute: string;

    NegativeBalanceRuleId: number;



    OverallUsageLimitType: UsageLimitType;

    OverallMinUsageLimit: number;//no usecases predicted

    OverallMaxUsageLimit: number;// at any point of time.. for ex. if 100 crdits are there,,emp can use 95% or 98

    UtilizationCycle: EntitlementCycle;

    UtilizationCycleStartDate: Date | string | null;

    UtilizationCycleEndDate: Date | string | null;

    UsageLimitTypePerUtilizationCycle: UsageLimitType;

    UtilizationUnitType: EntitlementUnitType;

    MaxUsageLimitPerUtilizationCycle: number;

    MinUsageInOneShot: number;

    MaxUsageInOneShot: number;


    IsApprovalRequired: boolean;

    IsOptionRequiredToUploadDocuments: boolean;

    AreSupportingDocumentsMandatory: boolean;



    //consider previous strech while applying for leave

    IsHolidayInclusive: boolean;//a simple setting to include any holidays which come in between

    HolidayConsiderationPolicy: LeaveAndHolidayMixConsiderationPolicy;

    ImpingeOnServicePeriod: boolean;


    ConsiderEarlierUsageForContinuityIndeterminingMaxUsagePerShot: boolean;
    //HolidayTypesToBeIncludedToValidateUsageLimit: SerializableDictionary<OccuranceType, HolidayType[]>;

    //HolidayTypesToBeIncludedToValidateLimit: number;
    //holiday types included in consecutiv uasage

    //for every 10 leaves .. lapse something
    IsQuickApplyRequired: boolean;

    IsHalfDayApplicable: boolean;
    IsAdditionalDateInputRequired: boolean;

    AdditionalDateLabelName: string;
    MaxDaysBeforeAdditionalDate: string;

    MaxDaysAfterAdditionalDate: string;

    InfoText: string;
    DownloadDocPath: string;
    DownloadLinkName: string;
    ProofDisplayRoleCodes: string;


}

export interface LeaveAndHolidayMixConsiderationPolicy {
    ApplicableForAllHolidayTypes: boolean;
    ApplicableHolidayTypes: HolidayType[];
    IsIncludedToValidateUsageLimit: boolean;
    ConsiderationType: LeaveRangeConsiderationType;
    HolidayOccuranceType: OccuranceType;
    //RangeAndActionList: number[];
}

//not sure if this is required, but think would be useful
export interface EntitlementGroup extends BaseModel {
    Code: string;
    Name: string;
    Description: string;

    Status: number;

    //CompanyId: number;
    //ClientId: number;
    //ClientContractId: number;
    //TeamId: number;
    //EmployeeId: number;
}



export interface EntitlementAvailmentRequest {
    Id: number;

    EmployeeId: number;
    EmployeeEntitlementId: number;
    EntitlementType: EntitlementType;
    EmployeeName: string;

    EntitlementId: number;
    EntitlementDefinitionId: number;
    EntitlementMappingId: number;
    UtilizationUnitType: EntitlementUnitType;

    ApplicablePayPeriodId: number;
    ApplicableAttendancePeriodId: number;

    AppliedFrom: Date | string | null;
    IsAppliedFromSecondHalf: boolean;//not ssure how to manage hours or quarter days
    IsAppliedForFirstHalf: boolean;//not ssure how to manage hours or quarter days
    AppliedTill: Date | string | null;
    IsAppliedTillFirstHalf: boolean;
    IsAppliedTillSecondHalf: boolean;
    AppliedUnits: number;
    CalculatedAppliedUnits: number;

    ApprovedFrom: Date | string | null;
    IsApprovedFromSecondHalf: boolean;//not ssure how to manage hours or quarter days
    IsApprovedForFirstHalf: boolean;//not ssure how to manage hours or quarter days
    ApprovedTill: Date | string | null;
    IsApprovedTillFirstHalf: boolean;
    IsApprovedTillSecondHalf: boolean;
    ApprovedUnits: number;

    AppliedOn: Date | string;
    AppliedBy: number;

    ValidatedOn: Date | string;
    ValidatedBy: number;

    ApplierRemarks: string;
    CancellationRemarks: string;

    ValidatorRemarks: string;

    Status: EntitlementRequestStatus;

    ActivityList: EntitlementAvailmentRequestActivity[];

    PendingAtUserId: number;

    PendingAtUserName: string;


}

export interface EntitlementAvailmentRequestActivity {
    Id: number;

    EntitlementAvailmentRequestId: number;

    UserId: number;
    UserName: string;
    Remarks: string;
    Status: EntitlementRequestStatus;
    IsLatest: boolean;

    CreatedOn: Date | string;
}

export interface EmployeeEntitlement extends BaseModel {
    EmployeeId: number;

    EntitlementId: number;
    EntitlementDefinitionId: number;

    Definition: EntitlementDefinition;

    EntitlementMappingId: number;

    DisplayName: string;//can be inherited from EntitlementMapping

    UnitType: EntitlementUnitType;
    UnitsForCurrentCycle: number;

    EntitlementFirstCreditDate: Date | string | null;
    EntitlementLastLapsedDate: Date | string | null;

    CurrentEntitlementCycleStartDate: Date | string | null;
    CurrentEntitlementCycleEndDate: Date | string | null;

    NextCreditDate: Date | string | null;
    NextLapseDate: Date | string | null;

    TotalUnitsCredited: number;
    TotalUnitsLapsed: number;

    TotalAvailedUnits: number;
    UnitsAvailedInCurrentCycle: number;

    AvailableUnits: number;
    EligibleUnits: number;

    IsLocked: boolean;
    Status: number;


    EntitlementAvailmentRequestList: EntitlementAvailmentRequest[];
    ClientId: number;
    ClientContractId: number;
    TeamId: number;
    StateId: number;
    LocationId: number;
    IsServingNoticePeriod: boolean;

    ManagerId: number;
    ManagerMailId: string;
    EmployeeMailId: string;
    ManagerName: string;
    EmployeeName: string;
    EmailSubject: string;
    EmailBody: string;
    //HolidayList: Holiday[];
    AvailmentRequest: EntitlementAvailmentRequest;

}

export interface EntitlementProcessActivity extends BaseModel {
    EmployeeEntitlementId: number;

    EmployeeId: number;
    EntitlementId: number;
    EntitlementDefinitionId: number;
    EntitlementMappingId: number;

    UnitsAffected: number;

    UnitsElapsed: number;


    Cycle: EntitlementCycle;
    Type: EntitlementProcessType;

    Remarks: string;
}

export enum EntitlementProcessType {
    Credit,
    Lapse

}

export interface EntitlementMapping extends BaseModel {
    //EntitlementGroupId: number;
    EntitlementDefinitionId: number;
    Status: number;

    DisplayName: string;

    CompanyId: number;

    ClientId: number;

    ClientContractId: number;

    TeamId: number;

    EmployeeId: number;

    EffectiveFrom: Date | string;

    EffectivePeriodId: number;

    ValidTill: Date | string;

    ExpiryPeriodId: number;

}

//should be able to set as per entl. type
export interface EntitlementNominee {

}

//Role - 
export interface UserManagerMapping extends BaseModel {
    CompanyId: number;
    ClientId: number;
    ClientContractId: number;
    TeamId: number;

    EmployeeId: number;//should this be userId???? /**//.. not sure  */
    UserId: number;

    RoleId: number;
    RoleUserId: number;

    EffectiveFrom: Date | string | null;//this shd be moved to actionlevel
    EffectiveTill: Date | string | null;

    ModuleApplicabilityList: ModuleAndActionApplicability[];
    //ActionId: number;

}

export interface ModuleAndActionApplicability {
    ModuleId: number;
    AllowedActions: number[];
    ExcludedActions: number[];

}

export interface ProxyManagerMapping extends BaseModel {
    CompanyId: number;
    ClientId: number;
    ClientContractId: number;

    ActionId: number;

    Teamid: number;
    //Department: string;

    RoleId: number;
    UserId: number;

    ProxyRoleId: number;
    ProxyUserId: number;

    EffectiveFrom: Date | string | null;
    EffectiveTill: Date | string | null;

}


