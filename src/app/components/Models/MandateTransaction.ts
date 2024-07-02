import { MandateTransactionCommunicationLog } from './MandateTransactionCommunicationLog';
import { InterviewSchedule } from './InterviewSchedule';
import { OfferDetails } from './OfferDetails';

export class MandateTransaction {
    Id?: number;
    MandateAssignmentDetailsID?: number;
    MandateDetailsID?: number;
    PersonID?: number;
    ClientID?: number;
    MandateStageID?: number;
    RejectedBy?: number;
    RejectedOn?: Date;
    RejectionReasons?: string;
    Remarks?: string;
    MandateTransactionProperties?: string;
    Status?: number;
    LastUpdatedOn?: Date;
    LastUpdatedBy?: Date;
    MandateTransactionCommunicationLog?: MandateTransactionCommunicationLog;
    InterviewSchedule?: InterviewSchedule;
    OfferDetails?: OfferDetails;
    RejectedByName?: string;
}

export const _MandateTransaction: MandateTransaction[] = [{
    Id: 0,
    MandateAssignmentDetailsID: 0,
    MandateDetailsID: 0,
    PersonID: 0,
    ClientID: 0,
    MandateStageID: 0,
    RejectedBy: null,
    RejectedOn: null,
    RejectionReasons: null,
    Remarks: '',
    MandateTransactionProperties: '',
    Status: 1,
    LastUpdatedOn: new Date,
    LastUpdatedBy: new Date,
    MandateTransactionCommunicationLog: {},
    OfferDetails: {},
    RejectedByName: ''
}];

