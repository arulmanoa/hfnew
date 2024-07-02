import { SessionDetails } from "src/app/components/Models/SessionDetails";
import { LoginResponses } from "..";
import { BaseModel } from "../Common/BaseModel";
import { ReportQueueMessageStatus } from "./ReportQueueMessageStatus";

export class ReportQueueMessage extends BaseModel{
    CompanyId  : number;
    ClientId  : number;
    ClientContractId  : number;
    TeamId  : number;
    EmployeeId  : number;
    IsEmailRequired : boolean;
    CCEMailIds : string;
    ErrorMessage  : string;
    Result  : any;
    Status  : ReportQueueMessageStatus;
    ReportTypeId : number
    MessageObject : any;
    Remarks : string;
    IsPreviewMode  : boolean;
    SessionDetails : LoginResponses
}