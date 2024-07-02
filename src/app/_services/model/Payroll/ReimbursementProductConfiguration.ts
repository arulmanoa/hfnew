import { MarkupType } from "../Client/MarkupMapping";
import { BaseModel } from "../Common/BaseModel";

export class ReimbursementProductConfiguration extends BaseModel{
    IsProductWiseMarkupRequired : boolean;
    IsMarkupApplicable : boolean ;
    AllowToInputBillableAmount : boolean;
    IsBillable : boolean ;
    IsTaxable : boolean;

    ValidationRuleId : number;
    MarkupType : number;
    AllowedPaymentsPerPeriod : number;
    MaxValue : number;
    MinValue : number;
    AllowNegativeValue : boolean;

    DisplayName : string;
    ProductId : number;
    ReimbursementConfigurationId : number;
    MaxLimitPerPeriod : number;
    MarkupValue : string;
}