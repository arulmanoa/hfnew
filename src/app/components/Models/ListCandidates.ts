
export class ListCandidates {
    PersonId: number;
    PersonName: string;
    SurName: string;
    PIN: string;
    DateOfBirth: string;
}

export class ListOfCandidatesDataSet {
    result: {
        Table: ListOfCandidates[];
    };
}

export class ListOfCandidates {
    PersonId: number;
    PersonName: string;
    SurName: string;
    PIN: string;
    DateOfBirth: string;
}
