export class DomesticPayment {
    // Status: string;
    // NameAsPerBank: string;
    // Identification: string;
    // SchemeName: string;
    // CompanyBankAccountId: number;
    // IsPaymentDone: boolean;
    // AcknowledgmentDetail: string;
    // MobileNumber: string;
    // ErrorMessage: string;
    // EmailId: string;
    // CreditorReferenceInformation: string;
    // AccountHolderName: string;
    // Amount: number;
    // IFSCCode: string;
    // AccountNumber: string;
    // ExternalRefId: string;
    // BankRefId: string;
    // InternalRefId: string;
    // PayoutStatus: PayOutDetailsStatus;
    // payoutlogs: [];

    ClientId: number;
        EmployeeId: number;
        LastUpdatedOn: Date | string;
        LastUpdatedBy: string;
        RequestedOn: Date | string;
        RequestedBy: string;
        payoutlogs: [];
        ErrorMessage: string;
        Status: string;
        NameAsPerBank: string;
        Identification: string;
        SchemeName: string;
        CompanyBankAccountId: number;
        IsPaymentDone: boolean;
        AcknowledgmentDetail: string;
        MobileNumber: string;
        EmailId: string;
        PayoutStatus: PayOutDetailsStatus;
        CreditorReferenceInformation: string;
        AccountHolderName: string;
        Amount: number;
        IFSCCode: string;
        AccountNumber: string;
        ExternalRefId: string;
        BankRefId: string;
        InternalRefId: string;
        Id: number;
        CandidateId: number;
        OtherRefId: number;
}


export enum PayOutDetailsStatus {
  

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