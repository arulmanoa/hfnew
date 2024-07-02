import { BaseModel } from "./Common/BaseModel";
import { UIMode } from "./Common/LoginResponses";
import { Rule } from "./Rule";
import { ProductGroup, _ProductGroup } from "./ProductGroup";
import { ProductType, _ProductType } from "./ProductType";

export enum ProductClassification {
    Earning = 1,
    Deduction = 2
}

export enum ProductCategory {
    Payroll = 1,
    Billing = 2
}

export enum ProductCalculationType {
    Fixed = 1,
    Variable = 2,
    Rule = 3
}

export enum RoundOffType {
    Nearest = 0,
    Highest = 1
}

export class Product extends BaseModel {
    Code: string;
    Name: string;
    Description: string;
    RoundOffType: RoundOffType;
    RoundOffValue: number;
    ProductTypeId: number;
    CalculationType: ProductCalculationType;
    ProductgroupId: number;
    ProductCategoryId: ProductCategory;
    Productgroup: ProductGroup;
    ProductType: ProductType;
    ProductApplicabilityLst: ProductApplicability[];
    LstProductRuleMapping?: ProductRuleMapping[];
    Modetype: UIMode;
    Status: number;

    IsLopApplicable: boolean;
    IsArrearApplicable: boolean;
    IsBillRequiredforProof: boolean;
    IsTaxprojectionRequired: boolean;
    TaxThresholdLimit: number;
    TaxCodeId: number;
    GLCode: string;
    LstProductCTCPayrollRuleMapping?: ProductCTCPayrollRuleMapping[]
    IsThresholdLimitApplicable: boolean;
    IsTaxCodeApplicable: boolean;
    IsBenefitProduct: boolean;
    ClientId: number;
    CompanyId: number;
}

export class ProductCTCPayrollRuleMapping {
    Id: number;
    Code: string;
    Name: string;
    Description: string;
    CTCRuleId: number;
    PayrollRuleId: number;
    ProductId: number;
    Modetype: UIMode;
    CTCRule: Rule[]
    PayrollRule: Rule[];
    Status: number;
}

export class ProductRuleMapping {
    Id: number;
    ProductId: number;
    RuleId: number;
    ProductRuleCategory: ProductRuleCategory;
    Rule: Rule;
    Modetype: UIMode;
}
export enum ProductRuleCategory {
    None = 0,
    CTCBreakup = 1,
    Payroll = 2
}

export class ProductApplicability {
    Id: number;
    Code: string;
    ApplicableProductIds: Product[];
    ApplicableProductGroupIds: Product[];
    ExcludedProductsIds: Product[];
    ProductGroupIds: any[];
    PerpetualExclusionProductIds: any[];
    RuleId: number;
    EffectiveDate: string;
    Status: number;
}

export class ApplicableProductGroup {
    applicableProductGroupId: number;
    isExcludedProduct: boolean;
    excludedProducts: Product[];
    ruleId: number;
}

export class ApplicableProduct {
    applicableProductId: number;
    productTypeId: number;
    ruleId: number;
}
export const _Product: Product = {
    Id: 0,
    Code: '',
    Name: '',
    Description: '',
    Status: 0,
    RoundOffType: 0,
    RoundOffValue: 0,
    ProductTypeId: 0,
    CalculationType: 0,
    ProductgroupId: 0,
    ProductCategoryId: 0,
    Productgroup: _ProductGroup,
    ProductType: _ProductType,
    ProductApplicabilityLst: [],
    LstProductRuleMapping: [],
    Modetype: 0,

    IsLopApplicable: false,
    IsArrearApplicable: false,
    IsBillRequiredforProof: false,
    IsTaxprojectionRequired: false,
    TaxThresholdLimit: 0,
    TaxCodeId: 0,
    GLCode: '',
    IsThresholdLimitApplicable: false,
    IsTaxCodeApplicable: false,
    IsBenefitProduct: false,
    CompanyId: 0,
    ClientId: 0
}