import { TimeCardStatus } from "./TimecardStatus";
import { UIMode, BaseModel } from "../Common/BaseModel";
import { ProcessCategory } from "./PayRun";

export class PayoutInformation {
    Id: number;
    CompanyId: number;
    ClientId: number;
    ClientContractId: number;
    ClientName: string;
    CompanyBankAccountId: number;
    PayrunIds: number[];
    PayPeriodId: number;
    PayPeriodName: string;
    RequestedBy: string;
    RequesterName: string;
    RequestedOn: Date | string;
    ApprovedId: string;
    ApprovedOn: Date | string;
    ApproverName: string;
    PayOutDate: Date | string;
    Status: PayOutStatus;
    LstPayoutInformationDetails: PayoutInformationDetails[];
    ErrorMessage: string;
    TransactionRemarks: string;
    PaymentMode?: number;
    ProcessCategory: ProcessCategory
    IsLocked: boolean;
    IsLockedBy: string;

}


export class PayoutInformationDetails {
    Id: number;

    PayoutInformationId: number;

    TimeCardId: number;

    EmployeeId: number;

    EmployeeName: string;

    BankName: string;

    IFSCCode: string;

    AccountNumber: string;

    MobileNumber: string;

    UPIId: string;

    PayPeriodId: number;

    PayPeriodName: string;

    Narration: string;

    NetPay: number;

    ExternalRefCode: string;

    AcknowledgmentDetail: string;

    IsPaymentDone: boolean;

    Status: PayOutDetailsStatus;

    IsPaymentHold: boolean;

    PayTransactionId: number;

    ModeType: UIMode;
    BankId: number;
    transferType: TransferType
    EmailId: string;
    ErrorMessage: string;
    payoutlogs: Payoutlog;
    CompanyBankAccountId: number;
    ReleasePayoutInformationId: number;
    PaymentMode: PaymentMode;
    IsLocked: boolean;
    IsLockedBy: string;
    IsReInitiated?: boolean;
}

export enum PaymentMode {
    None = 0,
    API = 1,
    BatchFile = 2,
    CheQue = 3,
    Other = 4
}

export enum TransferType {
    NEFT = 0,
    FT = 2,
    RTGS = 3,
    IMPS = 4,
    ANY = 5

}



export class Payoutlog {
    Id: number;

    PayoutRequestIds: number[];

    PaytransactionIds: number[];

    ObjectStorageId: number;

    NoOfRecords: number;

    LastUpdatedBy: string;

    LastUpdatedOn: Date | string;

    SourceData: string;

    LogData: string;

    IsSuccess: boolean;

}
export enum PayOutDetailsStatus {
    //    Initiated = 7000,
    //    Approved = 7500,
    //    Processing = 7700,
    //    Received = 7800,
    //    Completed = 10000,
    //    Failed = 6,
    //    TransactionFailed=7,
    //    SentToBeneficiary=8,
    //    Voided = 401,
    //    Stopped=100

    Initiated = 7000,
    Voided = 401,
    Stopped = 501,

    RejectionFailed = 7149,
    Rejected = 7150,
    ApprovalFailed = 7249,
    Approved = 7500,

    //Bank file generation
    BankFileGenerationInititated = 7510, // RELEASE 
    BankFileGenerationFailed = 7529,
    BankFileGenerated = 7550,

    //BankFile integration
    BankFileIntegrationInitiated = 7600,
    InternalErrorOnBankFileIntegration = 7629,
    BankFileIntegrationFailed = 7639,
    IntrnalErrorPostBankFileIntegration = 7649,
    BankFileIntgrated = 7670,

    //API
    InitiatedTransfer = 7700,
    InternalErrorBeforeTransfer = 7729,
    BankIntegrationFailed = 7749,  //(valid statuses: InitiatedTransfer, PaymentPostedToBank)
    PaymentPostedToBank = 7800,
    InternalErrorPostTransfer = 7829,

    //Common
    BankRejectedPayment = 7849,
    Paid = 10000,//  (valid statuses: PaymentPostedToBank, BankFileIntgrated)


}

export enum PayOutStatus {
    //    Initiated=1,
    //    Approved=2,
    //    Hold = 3,
    //    BatchPrepared =4,
    //    PaymentInitiated=5,
    //    Processing =6,
    //    Received = 7,
    //    Paid =8,
    //    Failed=9,
    //    Voided=101 

    Initiated = 7000,
    Cancelled = 101,
    Hold = 501,
    Rejected = 7149, //Finance rejected
    PartiallyApproved = 7400,
    Approved = 7500,
    ReleaseBatchPrepared = 7501,//Finance can prepare the Release Batch
    //File Based
    PaymentFileGenerationInititated = 7510,
    PaymentFileGenerationFailed = 7529,
    PaymentFileGenerated = 7550,

    FilePaymentTrnasferInitiated = 7600,
    FileIntegrationWithBankFailed = 7639, // applicable if host to host

    FileIntegratedWithBank = 7670, // file either added to bank via api or placed in host
    ResponseReceivedFromBankForFile = 7680, //if bank gives reponse per file

    //API Based
    APIPaymentTransferInitiated = 7700, // RELEASE
    SystemFailure = 7729, // fully failed, before bank api
    IntegrationFailed = 7749,
    IntegrationPartiallySuccess = 7770,//can give some gap(done)
    IntegrationSuccess = 7800,
    SystemFailurePostAPIIntegration = 7829,
    PartialSuccess=7900,
    Success=10000


}

export class PayOutModel extends BaseModel {
    NewDetails?: PayoutInformation;
    OldDetails?: any;
    customObject1: any;
    customObject2: any;
}

export const _PayOutModel: PayOutModel = {

    NewDetails: null,
    OldDetails: null,
    customObject1: {},
    customObject2: {},
    Id: 0

}


