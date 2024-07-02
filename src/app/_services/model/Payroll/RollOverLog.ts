export class RollOverlog {
    Id: number;

    CompanyId: number;

    ClientId: number;

    PayPeriods: PayPeriod[];

    ClientContractIds: number[];

    InitiatedBy: string;

    InitiatedOn: Date | string;

    CompletedOn: Date | string;

    IsSuccess: boolean;

    Remarks: string;

}

export class PayPeriod {
    "PayCycleId": number;
    "PayCyclePeriodName": string;
    "StartDate": Date;
    "EndDate": Date;
    "FinancialPeriodId": number;
    "IsOpen": boolean;
    "Status": number;
    "Modetype": number;
    "Id": number;
    "CreatedOn": Date;
    "LastUpdatedOn": Date;
    "CreatedBy": string;
    "LastUpdatedBy": string;
}