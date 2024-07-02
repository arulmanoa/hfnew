import { BaseModel } from "../Common/BaseModel";

export class AdhocPaymentProductConfiguration extends BaseModel{
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
    AdhocPaymentConfigurationId : number;
    MaxLimitPerPeriod : number;
    MarkupValue : string;
    ProductCode : string;
}