import { MandateDocuments } from './MandatesDetails';

export class RevenueSharing {
    Id?: number;
    OfferDetailsID?: number;
    EntityType?: number;
    EntityID?: number;
    ConsultantID?: number;
    GrossProfit?: number;
    SharingType?: number;
    Value?: number;
    ComputedValue?: number;
    ServiceFeeValue?: number;
    Remarks?: string;
    Status?: number;
    LastUpdatedOn?: Date;
    LastUpdatedBy?: string;
    EntityTypeName?: string;
    EntityName?: string;
    ConsultantName?: string;
    SharingTypeName?: string;
}

export const _RevenueSharingValues: RevenueSharing = {
    Id: 0,
    OfferDetailsID: 0,
    EntityType: 0,
    EntityID: 0,
    ConsultantID: 0,
    GrossProfit: 0,
    SharingType: 0,
    Value: 0,
    ComputedValue: 0,
    ServiceFeeValue: 0,
    Remarks: '',
    Status: 1,
    LastUpdatedOn: null,
    LastUpdatedBy: '',
    EntityTypeName: '',
    EntityName: '',
    ConsultantName: '',
    SharingTypeName: '',
};
