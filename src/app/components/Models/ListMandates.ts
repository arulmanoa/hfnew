export class ListMandates {
    ClientID: number;
    JobTitle: string;
    Status: number;
    RequestedClosureDate: string;
    RequestedResourcesNumber: number;
    WorkLocation: string;
    DelegationDate: string;
    DelegatedBy: string;
    TargettedResourcesNumber: number;
}

export class ListOfMandatesDataSet {
    result: {
        Table: ListOfMandates[];
    };
}

export class ListOfMandates {
    MandateId: number;
    ClientName: string;
    MandateRequirementId: number;
    JobTitle: string;
    Status: number;
    RequestedClosureDate: Date;
    PositionStatus: string;
    WorkLocation: string;
    OpenSince: string;
    Edit: string;
    Assign: number;
    Delegate: string;
    schedule?: string;
}
