import { EmployeeLifeCycleTransaction } from "./EmployeeLifeCycleTransaction";
import { EmployeeRateset } from "./EmployeeRateset";
import { EmploymentContract } from "./EmployementContract";
import { CandidateOfferDetails } from "../Candidates/CandidateOfferDetails";
import { CodegenComponentFactoryResolver } from "@angular/core/src/linker/component_factory_resolver";
import { Person } from "../Migrations/Transition";
import { TimeCard } from "../Payroll/TimeCard";

export class FnFDetails{

    EmployeeId : number;

    EmployeeCode : string;
    
    FirstName: string;

    LastName: string;

    PersonId : number;

    CountryOfOrigin: number;

    ClientName : string;

    ClientContractName : string;

    TeamName : string;

    CostCode : string;

    EmploymentContracts: EmploymentContract[];

    ELCTransactions: EmployeeLifeCycleTransaction[];

    EmployeeRateset : EmployeeRateset;

    GratuityRules : ProductPayRollRuleView[];

    NoticePaymentRules : ProductPayRollRuleView[];

    RecoveryRules : ProductPayRollRuleView[];

    LeaveEncashmentRules : ProductPayRollRuleView[];

    ManagerPersonDetails : Person;

    LeaveBalances : any[];

    AdjustmentProducts : any[];

    AllowanceProducts : any[];

    CostCodeList : any[];

    AttendanceStartDate : Date | string;

    PayPeriods : any[];

    SalaryTimeCards? : TimeCard[];

    FnFTimeCards: TimeCard[];

    CompanySettings? : any;

    ResignationReasons : any[];

    LetterTemplates : any[];

    TeamOpenPayPeriodId : number;
    
    NDCTransactions: any;
}

export class ProductPayRollRuleView {
    Code : string;
    Name : string;
    PayrollRuleId : number;
    ProductCode : number;
}