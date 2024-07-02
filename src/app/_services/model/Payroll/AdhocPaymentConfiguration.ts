import { BaseModel } from "../Common/BaseModel";
import { AdhocPaymentProductConfiguration } from "./AdhocPaymentProductConfiguration";

export class AdhocPaymentConfiguration extends BaseModel{
    CompanyId : number ;
    ClientId : number;
    ClientContractId : number;
    TeamId : number;
    EmployeeId : number;
    ProductConfigurationList : AdhocPaymentProductConfiguration[]
}