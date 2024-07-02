import { EmployeeLifeCycleTransaction } from "./EmployeeLifeCycleTransaction";

export class EmployeeLifeCycleTransactionModel
{
    newELCobj: EmployeeLifeCycleTransaction;
    oldELCobj: EmployeeLifeCycleTransaction;
    customObject1: any;
    customObject2: any;
    Id: number;
    OldRateSetId: number;
    OldELCId : number;
    UpdateContractStatus : boolean = false;
   
}