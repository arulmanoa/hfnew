import { MandateDocuments } from './MandatesDetails';
import { RevenueSharing } from './RevenueSharing';

export class OfferDetails {
    Id?: number;
    MandateTransactionID?: number;
    OfferedBy?: number;
    OfferedJobTitle?: string;
    OfferedWorkLocation?: string;
    OfferedSalary?: number;
    ExpectedDOJ?: Date;
    ActualDOJ?: Date;
    ServiceFeeType?: number;
    ServiceFeeValue?: number;
    GrossProfit?: number;
    Remarks?: string;
    Status?: number;
    LastUpdatedOn?: Date;
    LastUpdatedBy?: string;
    LstDocumentDetails?: MandateDocuments[];
    LstRevenueSharing?: RevenueSharing[];
}

export const _OfferDetailsValues: OfferDetails = {
    Id: 0,
    MandateTransactionID: 0,
    OfferedBy: 0,
    OfferedJobTitle: '',
    OfferedWorkLocation: '',
    OfferedSalary: 0,
    ExpectedDOJ: null,
    ActualDOJ: null,
    ServiceFeeType: 0,
    ServiceFeeValue: 0,
    GrossProfit: 0,
    Remarks: '',
    Status: 1,
    LastUpdatedOn: null,
    LastUpdatedBy: '',
    LstDocumentDetails: [],
    LstRevenueSharing: []
};
