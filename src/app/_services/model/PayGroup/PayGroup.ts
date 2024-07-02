import { BaseModel } from "../Common/BaseModel";
import { Product, ProductCTCPayrollRuleMapping } from "../Product";

export enum SalaryBreakUpType {
    CTC = 1,
    Gross = 2,
    NetPay = 3
}

export class PayGroup extends BaseModel {
    code: string;
    name: string;
    description: string;
    payGroupProductData: string;
    lstPayGroupProduct: PayGroupProduct[];
}

export enum MinWorkTimeType {
    None = 0,
    DaysFromDOJ = 1,
    WorkedDaysFromDOJ = 2,
    WorkedDaysInPayPeriod = 3,
    WorkedDaysInAttendancePeriod = 4,
    PayrollPeriods = 5
}

export class PayGroupProduct {
    id: number;
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