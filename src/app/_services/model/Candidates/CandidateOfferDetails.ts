import { BaseModel } from "../Common/BaseModel";
import { UIMode } from "../Common/LoginResponses";
import { CandidateRateset } from "./CandidateRateSet";
import { ApprovalStatus } from "./CandidateDocuments";
import { AcceptanceStatus, Gender, RejectionReason } from "../Base/HRSuiteEnums";

export enum OnBoardingType {
  Flash = 1,
  Proxy = 2
}

export enum SourceType {
  Any = 0,
  Recruitment = 1,
  Transfer = 2,
  Referral = 3
}

export enum IsClientApprovedBasedOn {
  Online = 1,
  Attachment = 2
}

export enum JobType {
  Temporary = 1,
  Permanent = 2,
  Internship = 3
}

export enum RequestType {
  OL = 1,
  AL = 2
}

export enum EmploymentType {
  FullTime = 1,
  PartTime = 2
}

export enum TenureType {
  Open = 0,
  Custom = 1,
  Month = 2
}

export enum BreakUpType {
  CTC = 1,
  GROSS = 2,
  NetPAY = 3
}

// export class CandidateOfferDetails extends BaseModel {
//     CandidateId: number;
//     JobTitle: string;
//     IndustryId: number;
//     WorkPremise: number;
//     Location: number;
//     State: number;
//     CityId : number;
//     Country: number;
//     SkillCategory: number;
//     Zone: number;
//     TenureType: TenureType;
//     TenureInterval: number;
//     CompanyId: number;
//     ClientId: number;
//     ClientContractId: number;
//     ClientContactId: number;
//     Designation: string;
//     DateOfJoining: string;
//     EndDate: string;
//     IsAutoupdateEndDate: boolean;
//     Aadhaar : number;
//     PANAckowlegementNumber: number;
//     IsPANExists : boolean;
//     IsPanApplied: boolean;
//     EffectivePayPeriodId: number;
//     NoticePeriodDays: number;
//     SourceType: SourceType;
//     IsClientApprovedBasedOn: IsClientApprovedBasedOn;
//     JobType: JobType;
//     EmploymentType: EmploymentType;
//     FUNCTIONALAREA: number;
//     IsAadhaarExemptedState: boolean;
//     LetterTemplateId: number;
//     RequestedBy: number;
//     RequestType: RequestType;
//     MandateRequirementId: number;
//     OnBoardingType: OnBoardingType; 
//     ProxyRemarks: string;
//     SalaryRemarks: string;
//     IsSelfRequest: boolean;
//     TeamProxyRequest: string;
//     ModuleTransactionId: number;
//     Modetype: UIMode;
//     LstCandidateRateSet: CandidateRateset[];
//     Status : OfferStatus;
//     IsMinimumwageAdhere : boolean; // false calculate reamrks message show
//     CalculationRemarks : string;
//     ApprovalStatus: ApprovalStatus;
//     ApprovalRemarks:string;
//     OnCostInsurance  : number; 
//     FixedInsuranceDeduction : number;
//     IsRateSetValid : boolean;
//     ReissueLetter: boolean; 
//     MonthlyBillingAmount : number; 
//     FatherName : string;
//     TeamId: number;
//     ManagerId : number;
//     LeaveGroupId : number;
//     CostCodeId : number;
//     AppointmentLetterTemplateId : number;
//     ActualDateOfJoining : string;
//     AcceptanceStatus: AcceptanceStatus;
// }


export class CandidateOfferDetails extends BaseModel {
  CandidateId: number;

  JobTitle: string;

  IndustryId: number;

  WorkPremise: number;

  Location: number;

  State: number;

  CityId: number;

  Country: number;


  SkillCategory: number;

  Zone: number;

  TenureType: TenureType | any;

  TenureInterval: number;

  CompanyId: number;

  ClientId: number;

  ClientContractId: number;

  ClientContactId: number;

  Designation: string;
  DesignationId: number;

  DateOfJoining: string;

  ActualDateOfJoining: string;

  EndDate: string;

  IsAutoupdateEndDate: boolean;

  EffectivePayPeriodId: number;

  NoticePeriodDays: number;

  SourceType: SourceType;

  IsClientApprovedBasedOn: IsClientApprovedBasedOn;

  JobType: JobType;

  EmploymentType: EmploymentType;

  FUNCTIONALAREA: number;

  IsAadhaarExemptedState: boolean;

  Aadhaar: number;

  IsMinimumwageAdhere: boolean;

  CalculationRemarks: string;

  PANAckowlegementNumber: number;

  IsPANExists: boolean;

  IsPanApplied: boolean;

  LetterTemplateId: number;

  AppointmentLetterTemplateId: number;

  RequestedBy: number;

  RequestType: RequestType;

  MandateRequirementId: number;

  OnBoardingType: OnBoardingType;

  ProxyRemarks: string;

  SalaryRemarks: string;

  IsSelfRequest: boolean;

  TeamProxyRequest: string;

  ModuleTransactionId: number;

  Modetype: UIMode;

  OnCostInsurance: number;

  MonthlyBillingAmount: number;


  FixedInsuranceDeduction: number;

  LstCandidateRateSet: CandidateRateset[];

  IsCandidateAcceptanceRequiredForOL: boolean;

  IsCandidateAcceptanceRequiredForAL: boolean;

  Status: OfferStatus;

  ApprovalStatus: ApprovalStatus;

  AcceptanceStatus: AcceptanceStatus | any;

  RejectionReason: RejectionReason;

  ApprovalRemarks: string;

  AcceptanceRemarks: string;

  FatherName: string;

  TeamId: number;

  ManagerId: number;

  LeaveGroupId: number;
  CostCodeId: number;
  IsRateSetValid: boolean;
  ReissueLetter: boolean;
  IsFresher: boolean;
  GMCAmount: number;
  GPAAmount: number;
  OLCCMailIdCC: string;
  ALCCMailIdCC: string;
  LstPayGroupProductOverrRides: PaygroupProductOverrides[];
  InsurancePlan: number;
  DOB: Date | string;
  Gender: Gender;
  Grade: string;

  Attribute1: string;
  Attribute2: string;
  Attribute3: string;
  Attribute4: string;


  ProposedDOJ: Date | string;
  IsRevisedDOJ: boolean;
  NapsContractCode: string;
  ApprenticeCode: string;
  IsNapsBased: boolean;
  IsMinimumWageCheckNotRequired: boolean;

  Department: any;
  JobProfile?: string;
  SubEmploymentType?: number;
  Category?: number;
  Division?: number;
  Level?: number;
  DepartmentId? :number;
  ReportingLocation: number | null;
  ReportingTime : any;
  JoiningTime : any
  SubEmploymentCategory? : number;
  IsLetterEdited: boolean;
  SourceDocBytes: any;
  CostCityCenter? : number;
  Building? : number;
  PRAN : string;
  EPSStatus : number;
  JobProfileId?: number;
  EmploymentZone?: number;
  CostCityCenterId: any;
}

export class PaygroupProductOverrides extends BaseModel {
  CompanyId: number;

  ClientId: number;

  ClientContractId: number;

  TeamId: number;

  PayGroupId: number;

  ProductId: number;

  ProductCTCPayrollRuleMappingId: number;

  EffectiveDate: Date | string;

  EffectivePeriod: number;

  Status: number;

  IsDefault: boolean;

  ProductApplicabilityCode: string;

  ProductCode: string;
}
export enum OfferStatus {
  Active = 1,
  InActive = 0
}




export const _CandidateOfferDetails: CandidateOfferDetails = {
  Id: 0,

  CandidateId: 0,

  JobTitle: "",

  IndustryId: 0,

  WorkPremise: 0,

  Location: 0,

  State: 0,

  CityId: 0,

  Country: 0,


  SkillCategory: 0,

  Zone: 0,

  TenureType: 2,

  TenureInterval: 0,

  CompanyId: 0,

  ClientId: 0,

  ClientContractId: 0,

  ClientContactId: 0,

  Designation: "",
  DesignationId: null,

  DateOfJoining: "",

  ActualDateOfJoining: "",

  EndDate: "",

  IsAutoupdateEndDate: false,

  EffectivePayPeriodId: 0,

  NoticePeriodDays: 0,

  SourceType: 1,

  IsClientApprovedBasedOn: 2,

  JobType: 1,

  EmploymentType: 1,

  FUNCTIONALAREA: 0,

  IsAadhaarExemptedState: false,

  Aadhaar: 0,

  IsMinimumwageAdhere: false,

  CalculationRemarks: "",

  PANAckowlegementNumber: 0,

  IsPANExists: false,

  IsPanApplied: false,

  LetterTemplateId: 0,

  AppointmentLetterTemplateId: 0,

  RequestedBy: 0,

  RequestType: 1,

  MandateRequirementId: 0,
  OnBoardingType: 1,
  ProxyRemarks: "",
  SalaryRemarks: "",
  IsSelfRequest: true,
  TeamProxyRequest: "",
  ModuleTransactionId: 0,
  Modetype: 1,
  OnCostInsurance: 0,
  MonthlyBillingAmount: 0,
  FixedInsuranceDeduction: 0,
  LstCandidateRateSet: null,
  IsCandidateAcceptanceRequiredForOL: false,
  IsCandidateAcceptanceRequiredForAL: false,
  Status: 1,
  ApprovalStatus: 0,
  AcceptanceStatus: 0 as any,
  RejectionReason: 0 as any,
  ApprovalRemarks: "",
  AcceptanceRemarks: "",
  FatherName: "",
  TeamId: 0,
  ManagerId: 0,
  LeaveGroupId: 0,
  CostCodeId: 0,
  IsRateSetValid: false,
  ReissueLetter: false,
  IsFresher: false,
  GMCAmount: 300000,
  GPAAmount: 150000,
  ALCCMailIdCC: "",
  OLCCMailIdCC: "",
  LstPayGroupProductOverrRides: [],
  InsurancePlan: 0,
  DOB: '',
  Gender: null,

  Grade: '',

  Attribute1: '',
  Attribute2: '',
  Attribute3: '',
  Attribute4: '',
  ProposedDOJ: '',
  IsRevisedDOJ: false,
  NapsContractCode: "",
  ApprenticeCode: "",
  IsNapsBased: false,
  IsMinimumWageCheckNotRequired: false,
  IsLetterEdited: false,
  SourceDocBytes: '',
  Department: '',
  JobProfile: '',
  SubEmploymentType: null,
  Category: null,
  Division: null,
  Level: null,
  DepartmentId : null,
  ReportingLocation : null,
  ReportingTime : null,
  JoiningTime : null,
  SubEmploymentCategory : null,
  CostCityCenter : null,
  Building : null,
  PRAN : '',
  EPSStatus : null,
  JobProfileId :  null,
  CostCityCenterId : 0
};
