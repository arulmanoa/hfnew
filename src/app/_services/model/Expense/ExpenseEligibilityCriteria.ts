import { BaseModel, UIMode } from "../Common/BaseModel";
import { Role, UserHierarchyRole } from "../Common/LoginResponses";

// export class ExpenseEligibilityCriteria extends BaseModel {
//     CompanyId: number;

//     ClientId: number;

//     ClientContractId: number;

//     TeamId: number;

//     AttributeId: number;

//     AttributeValueId: number;

//     AttributeValuePropertyId: number;

//     EmployeeId: number;

//     ProductId: number;

//     IsBillRequired: boolean;

//     IsAllowedToSubmitRequestPostMaxLimit: boolean;

//     IsApprovalRequired: boolean;

//     MinimumAmountForApproval: number;

//     AllowMultiple: boolean;

// }


export class ExpenseCycleConfiguration extends BaseModel {
    ExpenseEligibilityCriteriaId: number;

    CycleType: ExpenseCycleType;

    MaxAmount: number;

}

export enum ExpenseCycleType {
    Request = 0,
    Day = 1,
    Week = 2,
    PayrollMonth = 3,
    FinancialYear = 4,
    CalenderYear = 5,
    AttendancePeriod = 6
}


// export class ExpenseBatch extends BaseModel {


//     EmployeeId: number;
//     Name: string;
//     TotalRequestedAmount: number;
//     TotalApprovedAmount: number;
//     TotalNoOfRequests: number;
//     TotalNoOfDocuments: number;
//     RejectedClaimIds: number[];
//     ModuleProcessTransactionId: number;
//     TimeCardId: number;
//     ApproverUserId: number;
//     Status: number;
//     ExpenseClaimRequestList: ExpenseClaimRequest[];
//     ModeType: UIMode;


// }

export class ExpenseBatch extends BaseModel {

    EmployeeId: number;
    Name: string;
    TotalRequestedAmount: number;
    TotalApprovedAmount: number;
    TotalNoOfRequests: number;
    TotalNoOfDocuments: number;
    RejectedClaimIds: number[];
    Status: number;
    ExpenseClaimRequestList: ExpenseClaimRequest[];
    ModeType: UIMode;

}

export const _ExpenseBatch: ExpenseBatch = {
    Id: 0,

    EmployeeId: 0,

    Name: '',

    TotalRequestedAmount: 0,

    TotalApprovedAmount: 0,

    TotalNoOfRequests: 0,

    TotalNoOfDocuments: 0,
    RejectedClaimIds: [],
    // ModuleProcessTransactionId: 0,
    // TimeCardId: 0,
    // ApproverUserId: 0,
    Status: 0,
    ExpenseClaimRequestList: [],
    ModeType: 1


}



export class ExpenseClaimRequest extends BaseModel {

    Remarks: string;
    TimeCardId: number;
    ModuleProcessTransactionId: number;
    ApproverUserId: number;
    TravelRequestReferenceId: number;
    DocumentDate: Date | string;
    DocumentNumber: string;
    Status: ExpenseClaimRequestStatus;
    DocumentId: number;
    ExpenseFromDate: Date | string;
    ExpenseIncurredDate: Date | string;
    ApprovedAmount: number;
    RequestedAmount: number;
    ProductId: number;
    ExpenseBatchId: number;
    EmployeeId: number;
    ExpenseToDate: Date | string;
    ModeType: UIMode;
    DocumentName: any;
}

export enum ExpenseClaimRequestStatus {
    Deleted = 0,
    Saved = 100,
    Submitted = 200,
    Rejected = 300,
    Approved = 400,
    MigratedToTimeCard = 500,
    Paid = 600
}


export class SubmitExpenseClaimRequestModel {
    ExpenseClaimRequestList: ExpenseClaimRequest[];
    ModuleProcessAction: ProcessModuleActionEnum;
    Role: UserHierarchyRole;
    ActionProcessingStatus: number;
    Remarks: string;
    ClientId: number;
    ClientContractId: number;
    CompanyId: number;

}




export class SubmitExpenseBatchModel {
    ExpenseBatch: ExpenseBatch;
    ModuleProcessAction: ProcessModuleActionEnum;
    Role: UserHierarchyRole;
    ActionProcessingStatus: number;
    Remarks: string;
    ClientId: number;
    ClientContractId: number;
    CompanyId: number;

}



export enum ProcessModuleActionEnum {
    None = 0,
    InitiateOnboardingRequest = 1,
    OpsSubmitOnboardingRequest = 2,
    QcSubmitDocVerificationResult = 3,
    CandRejectOffer = 4,
    CandSubmitOnbDocuments = 5,
    OpsRejecttoRecruiter = 6,
    CandAcceptOlorAl = 7,
    CandidateMigration = 8,
    ClaimOnboardingRequest = 9,
    VoidOnboardingRequest = 10,
    ALRegenerationRequest = 11,
    QcSubmitAlRegenVerificationResult = 12,
    PreviewOLOrAL = 13,
    OpsSubmitRevisionRequest = 14,
    QcSubmitRevisionResult = 15,
    OpsResubmitRevision = 16,
    FnFRequestRaised = 17,
    FnFRequestResultSubmitted = 18,
    FnFRequestResubmitted = 19,
    BankDetailsSubmitESSRequest = 20,
    QcSubmitBankDetailsResult = 21,
    DocumentDetailsSubmitESSRequest = 22,
    QcSubmitDocumentDetailsResult = 23,
    EducationDetailsSubmitESSRequest = 24,
    QcSubmitEducationDetailsResult = 25,
    ExperienceDetailsSubmitESSRequest = 26,
    QcSubmitExperienceDetailsResult = 27,
    InvestmentSubmitESSRequest = 28,
    QcSubmitInvestmentResult = 29,
    SubmitAttendance = 30,
    SubmitVariableInputs = 31,
    SubmitAttendanceAndVariableInputs = 32,
    RejectAttendance = 33,
    RejectVariableInputs = 34,
    RejectAttendanceAndVariableInputs = 35,
    QcRejectedOnboardingRequest = 36,
    RejectBankDetailsRequest = 37,
    RejectInvestmentRequest = 38,
    RejectRevisionRequest = 39,
    SubmitExpenseClaimRequest = 40,
    RejectExpenseClaimRequest = 41,
    ApproveExpenseClaimRequest = 42,
    MigrateExpenseClaimRequests = 43
}

export class ValidateExpenseAmountModel {
    EmployeeId: number;
    ProductId: number;
    Amount: number;
    ExpenseIncurredDate: Date | string;
    Id : number;
}


export class MigrateExpenseModel {
    ExpenseClaimIds: number[];
    IsMergeBatches: boolean;
    ModuleProcessAction: ProcessModuleActionEnum;
    Role: UserHierarchyRole;
    ActionProcessingStatus: number;
    Remarks: string;
    ClientId: number;
    ClientContractId: number;
    ExpenseClaimRequestList: ExpenseClaimRequest[];
}

export enum RoundOffTo {
    None = 0,
    Nearest = 1,
    Highest = 2
}
export class ReimbursementProductConfiguration extends BaseModel {

    RoundOffTo: RoundOffTo;
    MarkupValue: string;
    MarkupType: any;
    IsProductWiseMarkupRequired: boolean;
    IsMarkupApplicable: boolean;
    AllowToInputBillableAmount: boolean;
    BillProductId: number;
    IsBillable: boolean;
    RoundOffValue: number;
    IsTaxable: boolean;
    AllowedPaymentsPerPeriod: number;
    MaxLimitPerPeriod: number;
    MaxValue: number;
    MinValue: number;
    AllowNegativeValue: boolean;
    DisplayName: string;
    ProductId: number;
    ReimbursementConfigurationId: number;
    ValidationRuleId: number;
    EligibilityCriteria: ExpenseEligibilityCriteria;
}

export class ExpenseEligibilityCriteria extends BaseModel {
    ExpenseCycleConfigurationList: ExpenseCycleConfiguration[];
    IsFromAndToDateFieldsRequired: boolean;
    IsBillDataRequired: boolean;
    IsBillRequired: boolean;
    IsAllowMultipleInBatch: boolean;
    MinimumAmountForApproval: number;
    IsApprovalRequired: boolean;
    IsAllowedToSubmitRequestPostMaxLimit: boolean;
    ProductId: number;
    EmployeeIds: number[];
    AttributeValuePropertyId: number;
    AttributeValueId: number;
    AttributeId: number;
    TeamId: number;
    ClientContractId: number;
    ClientId: number;
    CompanyId: number;
    ExpenseApproverConfigurationList: ExpenseApproverConfiguration[];
    IsAllowToInputApproverForEmployee: boolean;
}



export class ExpenseApproverConfiguration extends BaseModel {

    ExpenseEligibilityCriteriaId: number;
    FromAmount: number;
    ToAmount: number;
    ApproverRoles: UserHierarchyRole;
    Status: boolean;
}