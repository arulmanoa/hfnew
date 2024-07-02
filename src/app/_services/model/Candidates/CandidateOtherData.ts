import { UIMode } from "../Common/BaseModel";

export class CandidateOtherData {
    Id: number;
    CandidateId: number;
    StatutoryDetailData: string;
    LstCandidateStatutoryDtls: CandidateStatutoryDetails[];
    MiscellaneousData: string;
    Modetype: UIMode;
}

export class CandidateStatutoryDetails {
    Id: number;
    CandidateId: number;
    IsPreviouslyEmployed: boolean;
    PFNumber: string;
    UAN: string;
    ESICNumber: string;
    PAN: string;
}