import { BaseModel } from "../Common/BaseModel";
import { MarkupType } from "./MarkupMapping";

export class ProductBillingGroup extends BaseModel {
    Code: string;
    Name: string;
    Description: string;
    CompanyId: number;
    ClientId: number;
    ClientContractId: number;
    TeamId: number;
    EmployeeId: number;
    EffectiveDate: Date | string;
    EffectivePeriod: string;
    ProductBillingAttributeList: ProductBillingAttributes[];
    Status: number;
}

export class ProductBillingAttributes extends BaseModel {
    BillingApplicabilityGroupId: number;
    PaygroupId: number;
    ProductId: number;
    IsBillable: boolean;
    IsBillableOnActual: boolean;
    BillProductId: number;
    IsMarkUpApplicable: boolean;
    IsPartOfBillableCost: boolean;
    IsProductWiseBillingRequired: boolean;
    MarkupType: MarkupType;
    MarkupParameter: string;
    IsPartOfPayrollInputSheet: boolean;
    PayslipDisplayName: string;
    ProductNotes: string;
    Status: number;
    BillType: BillType
    MarkupBillType: BillType
    ServiceTaxBillType: BillType
}

export enum BillType { Negative = -1, None = 0, Positive = 1 }