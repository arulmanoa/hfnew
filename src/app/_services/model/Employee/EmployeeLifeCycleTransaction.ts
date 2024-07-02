import { BaseModel, UIMode } from "../Common/BaseModel";
import { TenureType, SourceType, JobType, EmploymentType, PaygroupProductOverrides } from "../Candidates/CandidateOfferDetails";
import { EmployeeRateset } from "./EmployeeRateset";
import { EmployeeFnFTransaction } from "./EmployeeFFTransaction";
import { DocumentApproval, DocumentApprovalStatus } from "../Approval/DocumentApproval";
import { Gender } from "../Base/HRSuiteEnums";


export class EmployeeLifeCycleTransaction extends BaseModel {

    EmployeeId: number;

    JobTitle: string;

    IndustryId: number;

    WorkPremise: number;

    Location: number;

    State: number;

    CityId : number;
    Country: number;


    SkillCategory: number;

    Zone: number;

    TenureType: TenureType;

    TenureInterval: number;

    CompanyId: number;

    ClientId: number;

    ClientContractId: number;

    DateOfJoining: Date | string;

    EndDate: Date | string;

    IsAutoupdateEndDate: boolean;

    EffectivePayPeriodId: number;

    NoticePeriodDays: number;

    SourceType: SourceType;

    JobType: JobType;

    EmploymentType: EmploymentType;

    FUNCTIONALAREA: number;

    IsAadhaarExemptedState: boolean;

    LetterTemplateId: number;

    ELCTransactionTypeId: ELCTRANSACTIONTYPE;
    DOB? : Date | string;
    Modetype: UIMode;

    EmployeeRatesets: EmployeeRateset[];

    Status: ELCStatus;
    IsRateSetValid: boolean;
    CalculationRemarks: string;
    InsuranceplanId : number;
    FixedInsuranceDeduction: number;
    IsLatest: boolean;
    Designation: string;
    CCMailIds: string;
    SendMailImmediately: boolean;
    EffectiveDate: Date | string;
    OnCostInsurance: number;
    IsMinimumwageAdhere: boolean;
    EmploymentContractId : number;

    ModuleProcessTransactionId : number;

    DocumentApprovalIds : ELCClientApproval[];

    LstPayGroupProductOverrRides : PaygroupProductOverrides[];

    QcRemarks : string;
    OpsRemarks : string;

    EmployeeFnFTransaction : EmployeeFnFTransaction;

    ContractEndDate : Date | string;

    DocumentApprovalLst : DocumentApproval[];

    LetterRemarks : string;

    OldLocation : number;

    OldDesignation : string;

    OldRatesetId : number;

    Gender?: Gender;
    Department: string;
    Grade: string;

    Attribute1: string;
    Attribute2: string;
    Attribute3: string;
    Attribute4: string;
      DepartmentId?: number ;
    Division?: number ;

    Level?:number;
    CostCityCenter?:number;
    ManagerId?:number;
    ReportingLocation? : number
    Category?:number;
    JobProfileId?:number;
    SubEmploymentType?:number;
    EmploymentZone ? : number;
    OldDesignationId ? : number;
    DesignationId ? : number
}

export class ELCClientApproval
{
    DocumentApprovalId : number;
    Status : DocumentApprovalStatus;
    Remarks : string;

}

export const _EmployeeLifeCycleTransaction: EmployeeLifeCycleTransaction = {

    EmployeeId: 0,
    JobTitle: "",
    IndustryId: 0,
    WorkPremise: 0,
    Location: 0,
    State: 0,
    Country: 0,
    SkillCategory: 0,
    Zone: 0,
    TenureType: 0,
    TenureInterval: 0,
    CompanyId: 0,
    ClientContractId: 0,
    ClientId: 0,
    DateOfJoining: new Date(),
    EndDate: new Date(),
    IsAutoupdateEndDate: false,
    EffectivePayPeriodId: 0,
    NoticePeriodDays: 0,
    SourceType: 0,
    JobType: 0,
    EmploymentType: 0,
    FUNCTIONALAREA: 0,
    IsAadhaarExemptedState: false,
    LetterTemplateId: 0,
    ELCTransactionTypeId: 0,
    Modetype: 0,
    EmployeeRatesets: [],
    Status: 0,
    CalculationRemarks: "",
    Id: 0,
    IsLatest: false,
    Designation: "",
    IsMinimumwageAdhere: false,
    InsuranceplanId : 0,
    OnCostInsurance: 0,
    EffectiveDate: new Date(),
    SendMailImmediately: false,
    CCMailIds: "",
    FixedInsuranceDeduction: 0,
    IsRateSetValid: false,
    CityId : 0,
    EmploymentContractId : 0,
    ModuleProcessTransactionId : 0,
    LstPayGroupProductOverrRides : [],
    QcRemarks : "",
    OpsRemarks : "",
    EmployeeFnFTransaction : null,
    ContractEndDate : new Date(),
    DocumentApprovalIds : [],
    DocumentApprovalLst : [],
    LetterRemarks : '',
    OldLocation : 0,
    OldDesignation : '',
    OldRatesetId : 0,
    DOB: null,
    Gender: null,
    Department: '',
    Grade: '',

    Attribute1: '',
    Attribute2: '',
    Attribute3: '',
    Attribute4: '',
    DepartmentId: null,
    Division: null,
}

export const _EmployeeRateset: EmployeeRateset = {

    EmployeeId: 0,

    EmployeeLifeCycleTransactionId: 0,

    PayGroupdId: 0,
    EffectiveDate: new Date(),

    IsMonthlyValue: false,

    SalaryBreakUpType: 0,

    Salary: 0,

    IsLatest: false,

    RateSetData: "",

    IsInsuranceApplicable: false,

    InsuranceId: 0,

    MonthlySalary: 0,

    AnnualSalary: 0,


    InsuranceAmount: 0,


    IsOveridable: false,

    Status: 0,

    RatesetProducts: [],

    Modetype: 0,

    EffectivePeriodId: 0,
    Id: 0,

    PaymentType:0,

    PayableRate:0,
    
    BillableRate:0,
   
    WageType: 0,

    additionalApplicableProducts: null,
    
    MinimumWagesApplicability: null

}


export enum ELCTRANSACTIONTYPE {

    // Offer = 1,
    // SalarayRevision = 2,
    // Termination = 3,
    // ReDesignation = 4,
    // ReLocation = 5,
    // ReLocation_Designation = 6,
    // Promotion = 7

    Offer = 1,
    SalaryRevision = 2,
    ReLocation = 3,
    ReDesignation = 4,
    SalaryRevision_ReLocation = 5,
    SalaryRevision_ReDesignation = 6,
    ReLocation_ReDesignation = 7,
    ContractExtension = 8,
    SalaryRevision_ReLocation_ReDesignation = 9,
    SalaryRevision_ContractExtension = 10,
    ReLocation_ContractExtension = 11,
    ReDesignation_ContractExtension = 12,
    SalaryRevision_ReLocation_ContractExtension = 13,
    SalaryRevision_ReDesignation_ContractExtension = 14,
    ReLocation_ReDesignation_ContractExtension = 15,
    SalaryRevision_ReLocation_ReDesignation_ContractExtension = 17,
    Resignation = 18,
    Termination = 19
}

export enum ELCStatus {

    // InActive = 0,
    // Active = 2,
    // Initiated = 1,
    // Rejected = 3,

    Voided = 0 , 
    Saved = 1,
    Active = 2,
    Initiated = 3,
    Rejected = 4,
    Approved = 5,
    ReSubmitted = 6,
    Submitted = 7,
    
}

