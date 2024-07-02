import { BaseModel } from "../Common/BaseModel";
import { ReimbursementProductConfiguration } from "./ReimbursementProductConfiguration";

export class ReimbursementConfiguration extends BaseModel{
    CompanyId : number ;
    ClientId : number;
    ClientContractId : number;
    TeamId : number;
    EmployeeId : number;
    ProductConfigurationList : ReimbursementProductConfiguration[]
}