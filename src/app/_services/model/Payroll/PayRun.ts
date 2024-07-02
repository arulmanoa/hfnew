import { BaseModel, UIMode } from "../Common/BaseModel";
import { TimeCardStatus } from "./TimecardStatus";

export class PayRun extends BaseModel {
    Code: string;
    Name: string;
    CompanyId: number;
    ClientId: number;
    ClientContractId: number;
    TeamIds: number[];
    PayPeriodId: number;
    PayCycleId:number;
    LstPayrunDetails: PayRunDetails[];
    NumberOfEmpoyees: number;
    NoOfSaleOrders: number;
    PayRunStatus: PayRunStatus;
    SaleOrders: SaleOrder[];
    ModeType : UIMode;
    IsMerge? : boolean;
    ProcessCategory? : number;

}


export class PayRunDetails extends BaseModel {
    EmployeeId: number;
    EmployeeCode: string;
    TimeCardId: number;
    EmployeeName: number;
    TimecardStatus: TimeCardStatus;
    PaytransactionId: number;
    GrossEarn: number;
    GrossDedn: number;
    NetPay: number;
    InvoiceIds: number[];
    ModeType : UIMode;

}

export enum PayRunStatus {
    Intitated = 1,
    Picked = 2,
    MarkpCalculated = 3,
    SaleorderCreated = 4,
    SaleOrderApproved = 5, // (payrun - saleorder appoved)
    SaleOrderRejected = 6,
    PayOutIntiated = 7,
    PayoutClaimed = 8,
    PayoutBatchCreated = 9,
    PayOutBatchInBank = 10,
    PayoutCompleted = 11,
    Voided = 101
}


export class RemovePayRunDetails {

    Id : number;
    PayrunId : number;
    EmployeeId : number;
    EmployeeCode : string;
    EmployeeName : string;
    TimeCardId : number;
    TimeCardSatus : number;
    PaytransactionId : number;
    GrossEarn : number;
    GrossDedn : number;
    NetPay : number;
    InvoiceIds : string;
    ModeType: UIMode;
     
}


// export class SaleOrder extends BaseModel {
//     SONumber: string;

//     ClientId: number;

//     ClientName: string;

//     ClientContractId: number;

//     BillingContactId: number;

//     BillingContactName: string;

//     BillingContactDetails: string;

//     CompanyContactName: string;

//     CompanyContactDetails: string;

//     CompanyBankAccountDetails: string;

//     CompanyGSTDetails: string;

//     ClientGSTDetails: string;

//     ShippingContactId: number;

//     ShippingContactName: string;

//     ShippingContactDetails: string;

//     Narration: string;

//     Remarks: string;

//     VendorName: string;

//     Duedate: Date | string;

//     PurchaseOrderNumber: string;

//     PurchaseOrderDate: Date | string;

//     SaleOrderDate: Date | string;

//     BillingTransactions: BillingTransaction[];

//     TotalCharge: number;

//     CGST: number;

//     IGST: number;

//     SGST: number;

//     TotalTax: number;

//     TotalDiscount: number;

//     TotalBillableAmount: number;

//     linkingSaledOrderId: number;

//     Status: number;


// }

// export class BillingTransaction extends BaseModel {
//     CompanyId: number;

//     ClientId: number;

//     ClientContractId: number;

//     TeamId: number;

//     PersonId: number;

//     EmployeeId: number;
//     EmployeeName: string;

//     CandidateId: number;

//     TimeCardId: number;

//     PayCycleId: number;

//     PayPeriodId: number;

//     FinancialPeriodId: number;

//     SaleOrderId: number;

//     InvoiceId: number;

//     ProcessCategory: number;

//     BillProductId: number;

//     OriginalBillingItemId: number;

//     Remarks: string;

//     Cost: number;

//     Markup: number;

//     AdjustedMarkup: number;

//     BillableAmount: number;

//     BillableUnits: number;

//     TotalMarkup: number;

//     TotalTax: number;

//     TotalBillAmount: number;

// }



// export class SaleOrder extends BaseModel
// {
//     SONumber: string;
//     ClientId: number;
//     ClientName: string;
//     ClientContractId: number;
//     BillingContactId: number;
//     BillingContactName: string;
//     BillingContactDetails: string;

//     CompanyContactName: string;

//     CompanyContactDetails: string;

//     CompanyBankAccountDetails: string;


//     CompanyGSTDetails: string;

//     ClientGSTDetails: string;


//     ShippingContactId: number;
//     ShippingContactName: string;
//     ShippingContactDetails: string;

//     Narration: string;
//     Remarks: string;

//     VendorName: string;

//     Duedate: Date | string;

//     PurchaseOrderNumber: string;

//     PurchaseOrderDate: Date | string;

//     SaleOrderDate: Date | string;

//     BillingTransactions: BillingTransaction[];

//     TotalCharge: number;

//     CGST: number;
//     IGST: number;
//     SGST: number;



//     TotalTax: number;

//     TotalDiscount: number;

//     TotalBillableAmount: number;


//     linkingSaledOrderId: number;

//     Status: SaleOrderStatus;



// }

// export enum SaleOrderStatus {
//     Initiated = 1,
//     ClientApproved = 2,
//     ClientRejected = 3,
//     InternalApproval = 4,

// }

export class BillingTransaction extends BaseModel { 
    CompanyId: number;
    ClientId: number;
    ClientContractId: number;
    TeamId: number;

    PersonId: number;
    EmployeeId: number;
    EmployeeName: string;
    CandidateId: number;

    TimeCardId: number;
    PayCycleId: number;
    PayPeriodId: number;
    FinancialPeriodId: number;
    SaleOrderId: number;
    InvoiceId: number;
    ProcessCategory: ProcessCategory;
    // ProcessCategory: ProcessCategory;

    BillProductId: number;
    OriginalBillingItemId: number;
    Remarks: string;
    Cost: number;
    Markup: number;
    AdjustedMarkup: number;
    BillableAmount: number;
    BillableUnits: number;
    TotalMarkup: number;
    TotalTax: number;
    TotalBillAmount: number;


}

export enum ProcessCategory
   {
       Any = 0, //dont use for timecard
       Salary = 1,
       AdhocPayment = 2,
       Expense = 3,
       Termination = 4

   }

export class SaleOrder extends BaseModel
    {
      
        Number: string;
        CompanyId: number;
        ClientId: number;
        ClientName: string;
        ClientContractId: number;
    
        ProcessCategory: ProcessCategory | null;
        PayCycleId: number | null;
        PayPeriodId: number | null;
        FinancialYearId: number;
        Month: number | null;
        Year: number | null;
        BillableAmount: number;
        BillableAmountForMarkup: number;
        BillableAmountForServiceTax: number;
        TotalDiscount: number;
        TotalMarkup: number;
        TotalServiceTax: number;
        TotalBillAmount: number;
        AdjustedBillAmount: number;
        AdjustedInvoiceId: number;

        Currency: CurrencyDetails;
        CompanyGSTN: string;
        ClientGSTN: string;

        CompanyBankAccountId: number;
        CompanyBankAccountDetails: string;


        CompanyBranchId: number;
        CompanyBranchName: string;
        CompanyAddressDetails: string;

        BillToClientContactLocationMappingId: number;
        BillToClientContactId: number;
        BillToClientLocationId: number;        
        BillToContactName: string;
        BillToAddressDetails: string;

        ShipToClientContactId: number;
        ShipToContactName: string;
        ShipToAddressDetails: string;

        Narration: string;
        Remarks: string;

        GroupingInfo: string;

        BillingTransactionList: BillingTransaction[];
        ServiceTaxList: [];
        AppliedPOList: AppliedPOInfo[];//tempfor now
        ValidationInfoList: SaleOrderValidationInfo[];
        AdjustmentList: SaleOrderAdjustmentDetails[];

        Status: SaleOrderStatus;
        PayRunId: number;
        ReferenceSaleOrder: number;
        ExpectedCollectionMode: CollectionMode;

        Attribute1: string;
        Attribute2: string;
        Attribute3: string;
        Attribute4: string;
        Attribute5: string;
        Attribute6: string;
      
        BillingTransactionIdList: number[];
        PurchaseOrderNo: string;
        IsSendEmailImmediatly: boolean;

    }

    export class SaleOrderAdjustmentDetails
    {
        Id: number;
        SourceInvoiceId: number;
        AdjustedSaleOrderId: number;
        AdjustedAmount: number;
        BalanceAmount: number;
    }

    export class CurrencyDetails extends BaseModel
    {
        Code: string;
        CountryId: number;
        Symbol: string;

        //INRConversionRate: number;
    }

    export enum CollectionMode {
        Cheque = 1,
        OnlineTransfer = 2,
    }

    export class AppliedPOInfo
    {
        Id: number;
        SaleOrderId: number;
        PurchaseOrderId: number;
        PurchaseOrderNumber: string;
        AmountUsed: number;
        BalanceAmount: number;
        IsActive: boolean;

        PODate: Date | string | null;//??????

    }

    //??
    export class SaleOrderValidationInfo
    {
        Id: number;
        SaleOrderId: number;
        IsApproved: boolean;
        Remarks: string;
        ValidatedOn: Date | string;
        SubmittedBy: number;
        ValidatedBy: number;
    }

    export enum SaleOrderStatus {
        Initiated = 1,
        MarkedforReIntitate = 2,
        SaleOrderApproved = 4,
        SaleOrderRejected = 5,
        SaleOrderMerged = 6,
        Invoiced = 7,
        Voided = 401

    }



    
   export class MarkupCalculationMessage
   {
       
       CompanyId: number;
       ClientContractId: number;
       TeamId: number;
       PayCycleId: number;
       EmployeeId: number;
       EmploymentContractId: number;
       ProcessCategory: ProcessCategory;
       TimeCardId: number;
       IsPushedtoQueue: boolean;
       Remarks: string;
       SessionDetails: any;
   }
