import { PayoutInformationDetails } from "../Payroll/PayOut";

export class EmployeeFnFTransaction{
    
    //General
    Id : number;
    EmployeeId : number;
    EmployeeLifeCycleTransactionId : number;
    FnFTransactionType : FnFType;
    
    //Resignation Properties
    ResignationDate : Date | string;
    ResignationReason : string;
    ResignationRemarks: string;

    //Termination Properties
    TerminationStartDate : Date | string;
    TerminationEndDate : Date | string;
    TerminationReason : TerminationReason;
    TerminationRemarks: string;

    CalculatedLastWorkingDate : Date | string;
    RequestedLastWorkingDate : Date | string;

    //Notice Period & Recovery
    NoticePeriodDays : number;
    NoticePeriodRuleId:number;
    RecoveryDays : number;
    RecoveryRuleId:number
    RecoveryRemarks : string;
    RecoveryAmount : number;
    IsSystemBasedRecovery : boolean;  // ! add to db

    //Leave Encashment
    LeaveEncashmentDays:number;
    LeaveEncashRuleId:number;
    LeaveEncashmentAmount : number;
    IsSystemBasedLeaveEncash : boolean; //! add to db

    //Gratuity
    IsSystemBasedGratuity:boolean;
    GratuityRuleId:number;
    GratuityAmount : number;
    GratuityPeriod : number;

    //Loan Recovery Amount
    LoanRecoveryAmount : number;

    //Product Inputs
    LeaveInputs : any[]
    VariableInputs : any[] | String;;
    AttendanceInputs : any[] | string;
    AdjustmentInputs : any[] | String;
   
    PayProcessType : PayProcessType;

    ESIRemarks : string //Employee state insurance remarks

    //Template Ids
    FnFLetterTemplateId : number;
    RelievingLetterTemplateId : number;
    TerminationLetterTemplateId : number;

    //Remarks
    Remarks : string;

    Status :TransactionStatus;

    IsStopSalaryforAll : boolean;
    StopSalaryDetails : PayoutInformationDetails[];

    AttendanceStartDate : Date | string;

    IsNillCase : boolean;

    PayPeriodId : number;

    TimeCardId : number;

    PeriodId : number;

} 

export enum PayProcessType{
    StopSalary =  0 ,
    StopReimbush = 1 ,
    StopAdocPayments = 2,
    StopAll = 3,
    CurrentMonthSettlement = 4
}

export enum FnFType {
    Resignation = 0,
    Termination = 1
}

export enum TransactionStatus{
    Voided = 0,
    Saved = 1,
    Submitted = 2,
    Initiated = 3 , 
    Rejected = 4,
    Aprroved = 5,
    SentForTimeCardProcess = 6
}

export enum ResignationReasons{
    BetterOpportunities = 0,
    SalaryCompensation = 1,
    HealthIssues = 2 ,
    Others = 3
}

export enum TerminationReason{

}
