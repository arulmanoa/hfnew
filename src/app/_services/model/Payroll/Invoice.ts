import { BaseModel } from "../Common/BaseModel";
import { BillingTransaction } from "./PayRun";

export class Invoice extends BaseModel
{

    CompanyGSTN: string;
    ClientGSTN: string;
    CompanyBankAccountId: string;
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
    Status: InvoiceStatus;
    ReferenceInvoiceId: string;
    ExpectedCollectionMode: number;
    Attribute1: string;
    Attribute2: string;
    Attribute3: string;
    Attribute4: string;
    Attribute5: string;
    Attribute6: string;
    Currency: number;
    PurchaseOrderNo: string;
    AdjustedInvoiceId: number;
    TotalBillAmount: number;
    InvNo: string;
    InvoiceDate: Date | string;
    CompanyId: number;
    ClientId: number;
    ClientName: string;
    ClientContractId: number;
    SaleOrderIds: string;
    ServiceTaxCategory: number;
    IsServiceTaxExempted: boolean;
    CreditPeriodDays: number;
    IsElectronicInvoice: boolean;
    IsInvoiceManuallyGenerated: boolean;
    LineOfBusiness: number;
    BusinessCategory: number;
    InvoiceType: number;
    ProcessCategory: number;
    PayCycleId: number;
    PayPeriodId: number;
    FinancialYearId: number;
    Month: number;
    Year: number;
    BillableAmount: number;
    BillableAmountForMarkup: number;
    BillableAmountForServiceTax: number;
    TotalDiscount: number;
    TotalMarkup: number;
    TotalServiceTax: number;
    AdjustedBillAmount: number;
    BillingTransactions: BillingTransaction[];
}

export enum InvoiceStatus
    {
        Initiated = 1,
        Invoiced = 7,
        Voided = 401
    }

    export enum CollectionType
    {
        None=0,
        PartialCollected=1,
        Collected=2,
        Hold=3
    }