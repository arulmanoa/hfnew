import { ELCTransactionType } from "../Base/HRSuiteEnums";
import { ELCStatus } from "./EmployeeLifeCycleTransaction";

export class ELCGrid{
    EmployeeId : number;
    EmployeeCode : string;
    EmployeeName : string;

    EffectiveDate :string;
    EffectivePayPeriod : string;
    ELCTransactionType : ELCTransactionType;
    DOJ : string;
    TransactionStatus : ELCStatus;

    ClientId : number;
    ClientName :string;
    ClientContractId :number;

    ModuleProcessTransactionId : number;
}