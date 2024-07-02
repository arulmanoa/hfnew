import { LoginResponses } from '../Common/LoginResponses';
export class PayrollQueueMessage {
    TimeCardId: number;
    EmployeeName: string;
    MessageObject: any;
    OldMessageObject: any;
    SessionDetails: LoginResponses;
    Remarks: string;
    RuleSetCode: string;
    IsPushedToQueue: boolean;
}