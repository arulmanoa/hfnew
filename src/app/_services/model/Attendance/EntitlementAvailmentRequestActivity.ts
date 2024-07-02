import { EntitlementRequestStatus } from "./EntitlementAvailmentRequest";

export class EntitlementAvailmentRequestActivity {

    Id: number;
    EntitlementAvailmentRequestId: number;
    UserId: number;
    UserName: string;
    Remarks: string;
    Status: EntitlementRequestStatus;
    IsLatest: boolean;
    CreatedOn: Date | string;
}