import { MandateDocuments } from './MandatesDetails';

export class MandateTransactionCommunicationLog {
    Id?: number;
    MandateTransactionID?: number;
    RecipientType?: number;
    RecipientName?: string;
    CommunicationType?: number;
    CommunicationDate?: Date;
    CommunicationCoordinates?: string;
    ContactedBy?: number;
    SenderCoordinates?: string;
    ToBeFollowedUp?: boolean;
    FollowUpDate?: Date;
    Properties?: string;
    TransCommunicationProperties?: TransCommunicationProperties;
    Remarks?: string;
    Status?: number;
    LastUpdatedOn?: Date;
    LastUpdatedBy?: string;
    LstDocumentDetails?: MandateDocuments[];
    MailSubject?: string;
    ManagerEmailID?: string;
}
export class TransCommunicationProperties {
    SendCV: Boolean;
    AttachOriginalCV: Boolean;
    AddCC: string;
}
export const _TransCommunicationProperties = {
    SendCV: false,
    AttachOriginalCV: false,
    AddCC: ''
};

export const _MandateTransactionCommunicationLog: MandateTransactionCommunicationLog = {
    Id: 0,
    MandateTransactionID: 0,
    RecipientType: 1,
    RecipientName: '',
    CommunicationType: 1,
    CommunicationDate: new Date,
    CommunicationCoordinates: '',
    ContactedBy: 0,
    SenderCoordinates: 'noreply@cielhr.com',
    ToBeFollowedUp: false,
    FollowUpDate: null,
    Properties: null,
    Remarks: '',
    Status: 1,
    LastUpdatedOn: new Date,
    LastUpdatedBy: '',
    TransCommunicationProperties: _TransCommunicationProperties,
    LstDocumentDetails: [],
    MailSubject: 'CV Details',
    ManagerEmailID: ''
};


