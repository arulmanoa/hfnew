import { BaseModel } from "../Common/BaseModel";

export class InvoiceFromAndToMapping extends BaseModel {

    Code: string;
    Description: string;
    CompanyId: number;
    ClientId: number;
    ClientContractId: number | null;
    BillingContactLocationMappingId: number;
    ShippingContactId: number;
    CompanyBranchId: number;
    IsActive: boolean;

}