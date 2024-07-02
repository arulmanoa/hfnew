import { EmployeeRateset, _EmployeeRateset } from "./EmployeeRateset";
import { UIMode } from "../Common/BaseModel";

export class EmploymentContract
{
    Id: number;
    CandidateId: number;
    EmployeeId: number;
    StartDate: Date | string;
    EndDate: Date | string;
    Status: number;
    Designation: string;
    DesignationId: number;
    WorkLocation: string;
    StateId: number;
    CityId: number;
    CostCodeId: number;
    ClientContractId: number;
    ClientId: number;
    ClientLocationId: number;
    ClientContactId: number;    
    IsNewTaxRegimeOpted: boolean;
    IsESICApplicable: boolean;
    IsResigned: boolean;
    PayCycleId: number;
    IsFirstMonthPayoutdone : boolean;
    LstRateSets: EmployeeRateset[];
    Modetype: UIMode;    
    CompanyId: number;  
      
    Grade: any;    
    ManagerId: number;    
    TeamId: number;
    NoticePeriodDays : number | any;
    OpenPayPeriodId : number;
    LastPaymentPeriodId : number;
    LWD : any;
    EmploymentType: any;
    IsESSRequired? : boolean;
    PFLogic? : string;
    PFNumber? : string;
    IsEmployeeDeductionApplicable : boolean;
    IsExemptionDeclarationApplicable : boolean;
    ResignationDate : string | Date;
    PON : string;
    LeaveGroupId? : number;
    CustomData1: string;
    CustomData2: string;
    CustomData3: string;
    CustomData4: string;
    Department : any;
    JobProfile? : string;
    SubEmploymentType? : number;
    Category? : number;
    Division? : number;
    Level? : number;
    DepartmentId: number;
    SubEmploymentCategory? : number;
    JobProfileId? : number;
    EmploymentZone?: number | null;
    CostCityCenter?: number | null;
    ReportingLocation? : number;
    IndustryId?: number;

   
}


export const _EmploymentContract : EmploymentContract = {

    Id: 0,
    CandidateId: 0,
    EmployeeId: 0,
    StartDate: null,
    EndDate: null,
    Status: 1,
    Designation: '',
    DesignationId: null,
    WorkLocation:'',
    StateId: null,
    CityId: null,
    CostCodeId: null,
    ClientContractId: null,
    ClientId: null,
    ClientLocationId: null,
    ClientContactId:null,
    IsNewTaxRegimeOpted: false,
    IsESICApplicable: false,
    IsResigned: false,
    PayCycleId: null,
    IsFirstMonthPayoutdone : false,
    LstRateSets: [_EmployeeRateset],
    Modetype: 0,
    CompanyId: null,
   
    Grade: '', 
    ManagerId:null,
    TeamId:null,
    NoticePeriodDays : null,
    OpenPayPeriodId : null,
    LastPaymentPeriodId :null,
    LWD : null,
    EmploymentType: null,
    IsESSRequired :false,
    PFLogic : '',
    PFNumber: '',
    IsEmployeeDeductionApplicable : false,
    IsExemptionDeclarationApplicable : false,
    ResignationDate :null,
    PON : '',
    LeaveGroupId :null,
    CustomData1: '',
    CustomData2: '',
    CustomData3: '',
    CustomData4: '',
    Department:'',
    JobProfile : '',
    SubEmploymentType :null,
    Category : null,
    Division :null,
    Level :null,
    DepartmentId : null,
    SubEmploymentCategory : null,
    JobProfileId : null,
    EmploymentZone: null,
    CostCityCenter:null,
    ReportingLocation : null
}


export class ResignationDetails
{
    ResignationDate: Date | string;
    TerminationReason: TerminationReason;
}


export enum TerminationReason { 
    Termination=1,
    Resigned=2
}

