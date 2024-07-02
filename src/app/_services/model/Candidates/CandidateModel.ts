import { CandidateDetails } from "./CandidateDetails";
import { CandidateRateset } from "./CandidateRateSet";

export enum CandidateListingScreenType {
    RecruiterSaved = 1,
    RecruiterRejected = 2,
    RecruiterTeam = 3,
    RecruiterAll = 4
}

export class CandidateModel  {
    NewCandidateDetails?: CandidateDetails;
    OldCandidateDetails: CandidateDetails;
    CandidateRateSet: CandidateRateset;
    customObject1: any;
    customObject2: any;
    Id: number;
   
}

export const _CandidateModel : CandidateModel = {

    NewCandidateDetails: null,
    OldCandidateDetails: null,
    CandidateRateSet: null,
    customObject1: {},
    customObject2: {},
    Id: 0
   
}
