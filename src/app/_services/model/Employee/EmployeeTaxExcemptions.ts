// import { BaseModel, UIMode } from "../Common/BaseModel";
// //import {EmployeeExemptionBillDetails} from ''
// export class EmployeeTaxExemptionDetails extends BaseModel {

//     EmployeeId: number;

//     FinancialYearId: number;

//     ProductId: number;

//     Amount: number;

//     InputsRemarks: string;

//     ApproverRemarks: string;

//     IsProposed: boolean | null;

//     ApprovedAmount: number | null;

   
//     Status: number | null;

//     DocumentId: number;             

//     Modetype: UIMode;


//   //  LstEmployeeExemptionBillDetails: EmployeeExemptionBillDetails[];
// }

import { ApprovalStatus } from "../Candidates/CandidateDocuments";
import { BaseModel, UIMode } from "../Common/BaseModel";
import {EmployeeExemptionBillDetails} from "./EmployeeExcemptionsBillDetails"
import { InvestmentLogHistory } from "./EmployeeInvestmentDeductions";
export class EmployeeTaxExemptionDetails extends BaseModel {

    EmployeeId: number;

    FinancialYearId: number;

    ProductId: number;

    Amount: number;

    InputsRemarks: string;

    ApproverRemarks: string;

    IsProposed: boolean | null;

    ApprovedAmount: number | null;

   
    Status: number | null;

    DocumentId: number;             

    Modetype: UIMode;

    EmployeeExemptionBillDetails: string;

    LstEmployeeExemptionBillDetails: EmployeeExemptionBillDetails[];
    LstInvestmentLogHistory: InvestmentLogHistory[];
}
