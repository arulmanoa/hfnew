import { BaseModel } from "../Common/BaseModel";

export class ProductWiseInvoiceGroup extends BaseModel
{
    Code: string;

    EffectivePeriodId: number; 

    CompanyId: number;
    ClientId : number;

    ClientContractId: number;

    TeamId: number;

    EmployeeId: number;

    ApplicableProductIds: number[];

    Status: number;
    //IsInvoiceGroupRuleApplicable: boolean;

    //lstPrimaryInvoiceGroupProduct: PrimaryInvoiceGroupingProducts[];

    //PercentageSplits: string;
}