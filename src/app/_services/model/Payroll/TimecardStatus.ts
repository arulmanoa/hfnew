// export enum TimeCardStatus {

//     Initiated = 1000,
//     InQueue = 1100,
//     Picked = 1200,
//     Failed = 1249,
//     Processed = 2000,
//     SentForQc = 2300,
//     QcRejected = 2349,
//     QcApproved = 3000,
//     SaleOrderCreated = 4000, // once confirm timcard status 4000
//     SentForApproval = 4200,
//     ClientRejected = 4249,
//     ClientApproved = 4500,  /// sale order listing 
//     Invoiced = 5000,
//     Paid = 6000,
//     Voided = 401
//     payoutbatchcreated = 4700

// }


export enum TimeCardStatus {
    Initiated = 1000,//created - allo
    InPayrollQueue = 1100,
    CalculatingPayroll = 1200,
    PayrollCalculationFailed = 1249, //aloow
    PayrollCalculated = 2000, //PayTransactionCreated allow
    SentForQc = 2300,
    QcRejected = 2349, // alow
    QcApproved = 3000,//locked // alow
    InBillingQueue = 4100,
    CalculatingMarkup = 4200,
    MarkupCalculationFailed = 4249, // allow
    BillingTransactionCreated = 4500, // greater than 4500 or 2300 not allow to edit // allow
    SaleOrderCreated = 5000,
    SentForApproval = 5200,
    ClientRejected = 5249,
    ClientApproved = 6000,//Billingsheet approved (appove so) payrun (approved - [ayrun]) // sme for payrun creation
    PaymentTransactionFailed = 6349,
    PayoutBatchCreated = 7000,
    PayoutBatchRejected = 7349,
    PayoutBatchApproved = 7500,
    PayoutBatchPrepared = 7700,
    Invoiced = 8000,//included in invoice?? or invoice sent to client??
    Paid = 10000,//payment done.. is option required to handle partially paid here??
    Voided = 401//voided

}


export enum TimeCardStatus_SME {
    Initiated = 1000,//created

    InPayrollQueue = 1100,
    CalculatingPayroll = 1200,
    PayrollCalculationFailed = 1249,
    PayrollCalculated = 2000, //PayTransactionCreated
    SentForQc = 2300,
    QcRejected = 2349,
    QcApproved = 3000,//locked
    InBillingQueue = 4100,
    CalculatingMarkup = 4200,
    MarkupCalculationFailed = 4249,
    BillingTransactionCreated = 4500,
    SaleOrderCreated = 5000,
    SentForApproval = 5200,
    PaysheetRejected = 5249,
    PaysheetApproved = 6000,//Billingsheet approved
    PaymentTransactionFailed = 6349,
    PayoutBatchCreated = 7000,

    PayoutBatchRejectionFailed = 7149,
    PayoutBatchRejected = 7150,
    PayoutBatchApprovalFailed = 7249,
    PayoutBatchApproved = 7500,
    PayoutBatchPrepared = 7550,

    InitiatedTransfer = 7700,
    InternalErrorBeforeTransfer = 7729,
    BankIntegrationFailed = 7749, //(valid statuses: InitiatedTransfer, PaymentPostedToBank)

    PaymentPostedToBank = 7800,
    InternalErrorPostTransfer = 7829,
    BankRejectedPayment = 7849,
    Invoiced = 8000,//included in invoice?? or invoice sent to client??
    PaymentTransactionFailedAfterInvoice = 8349,
    Paid = 10000,//payment done.. is option required to handle partially paid here??
    Voided = 401//voided
}


