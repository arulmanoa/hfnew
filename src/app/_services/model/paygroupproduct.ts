import { MinWorkTimeType } from "./PayGroup/PayGroup";
import { Product, ProductCTCPayrollRuleMapping, _Product } from "./Product";

export class Paygroup {
    
    Id:	number;
    Code:	string;
    Name:	string;
    Description:	string;
    PayGroupProductData:	string;
    SalaryBreakUpType:	number;
    LstPayGroupProduct:	PayGroupProduct[];
    // Status:number;
    ClientId: number;
    ClientContractId: number;
    TeamId: number;
    CustomData1: string;
    CustomData2: string;
    CustomData3: string;
    RuleSetId: number;
}

export const _Paygroup : Paygroup = {

    Id:	0,
    Code: '',
    Name: '',
    Description: '',
    PayGroupProductData: '',
    SalaryBreakUpType: 0,
    LstPayGroupProduct:	null,
    // Status:0,
    ClientId: 0,
    ClientContractId: 0,
    TeamId: 0,
    CustomData1: '',
    CustomData2: '',
    CustomData3: '',
    RuleSetId: 0
}


export class PayGroupProduct {
    Id: number;
    payGroupId: number;
    productId: number;
    // productRuleMappingId: number;
    product: Product;
    DisplayName: string;
    CalculationOrder: number;
    DisplayOrder: number;
    IsOveridable: boolean;
    ReverseSequenceOrder: number;
    IsRecalculationrequired: boolean;
    IsAdjustmentProduct: boolean;
    Decimalvalue: number;
    Numericvalue: number;
    Stringvalue: string;
    IsLopApplicable: boolean;
    IsArrearApplicable: boolean;
    IsBreakUpApplicable: boolean;
    TaxProductId: number;
    IsTaxOverridable: boolean;
    IsTaxprojectionRequired: boolean;
    IsThresholdLimitApplicable: boolean;
    TaxThresholdLimit: number;
    IsTaxCodeApplicable: boolean;
    TaxCodeId: boolean;
    IsBillable: boolean;
    ProductCTCPayrollRuleMappingId: number;
    ProductCTCPayrollRuleMapping: ProductCTCPayrollRuleMapping;
    isEditable: boolean;
    IsProrationRequiredForNewJoiner: boolean;
    ConsiderLatestAmountWhenSplitsExist: boolean;
    MinWorkTimeType: MinWorkTimeType;
    MinWorkTimeToPay: number;
    IsEncashDaysNotApplicable: boolean;
    IsArrearRequiredForNonAdheredMinWorkTimePeriods: boolean;
    IsGrossTaxUpApplicable: boolean;
    GLCode: string;
    CustomData1: string;
    CustomData2: string;
    CustomData3: string;
}
