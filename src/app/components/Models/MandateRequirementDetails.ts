import { MandateDocuments } from './MandatesDetails';
import { MandateSchedule } from './MandateSchedule';
import { MandateTransaction } from './MandateTransaction';

export class MandateRequirementDetails {
    Id: number;
    MandateId: number;
    ClientContactId: number;
    Code: string;
    WorkLocation: string;
    CityId: number;
    StateId: number;
    CountryId: number;
    RequestedResourcesNumber: number;
    RequestedClosureDate: Date;
    Qualification: string;
    ExperienceFrom: number;
    ExperienceTo: number;
    RelevantExperienceFrom: number;
    RelevantExperienceTo: number;
    AnnualCTCFrom: number;
    AnnualCTCTo: number;
    Remarks: string;
    Status: number;
    LastUpdatedOn: Date;
    LastUpdatedBy: string;
    PublishJob: Boolean;
    LstMandateAssignmentDetails?: MandateAssignmentDetails[];
    LstDocumentDetails?: MandateDocuments[];
    FileNames: string[];
}

export class MandatesRequirementDetailsView extends MandateRequirementDetails {
    StateName?: string;
    StatusName?: string;
    CityName?: string;
    CountryName?: string;
    ClientContact?: string;
    ClosureDate?: string;
}
export class MandateAssignmentDetails {
    Id: number;
    MandateDetailsID: number;
    AssignmentParentID: number;
    MandateDelegatedTo: number;
    ManagerID: number;
    DelegatedBy: number;
    DelegationDate?: Date;
    TargettedResourcesNumber: number;
    TargettedClosureDate: Date;
    Accepted: number;
    Status: number;
    AcceptedOn?: Date;
    AcceptedBy: number;
    Remarks: string;
    LastUpdatedOn?: Date;
    LastUpdatedBy: string;
    LstMandateSchedule: MandateSchedule[];
    LstAllStageMandateTransaction?: LifeCycleStageMandateTransaction;
}

export class MandateAssignmentDetailsUpdate extends MandateAssignmentDetails {
    MandateDelegatedToName?: string;
    ManagerIDName?: string;
    StatusName?: string;
    LstMandateTransaction?: MandateTransaction[];
    LstAllStageMandateTransaction?: LifeCycleStageMandateTransaction;
}

export class LifeCycleStageMandateTransaction {
    RecruitmentLongListedStage?: RecruitmentLongListedStage[];
    RecruitmentShortListedStage?: any[];
    RecruitmentInterviewScheduleStage?: RecruitmentInterviewScheduleStage[];
    RecruitmentOfferDetailsStage?: RecruitmentOfferDetailsStage[];
    RecruitmentCandidateAcceptedStage?: RecruitmentCandidateAcceptedStage[];
    RecruitmentCandidateRejectedStage?: RecruitmentCandidateRejectedStage[];
    RecruitmentCandidateOnholdConsideringStage?: RecruitmentCandidateOnholdConsideringStage[];
    RecruitmentCandidateJoinedStage?: RecruitmentCandidateJoinedStage[];
}

export class RecruitmentLongListedStage extends MandateTransaction {
    Name: string;
    PersonId: number;
    IsCheckboxEnabled?: boolean;
    LastUpdatedOn: Date;
    ContactNumber?: number;
}


export class RecruitmentShortListedStage extends MandateTransaction {
    Name: string;
    PersonId: number;
    IsCheckboxEnabled?: boolean;
    LastUpdatedOn: Date;
    ContactNumber?: number;
}


export class RecruitmentInterviewScheduleStage extends MandateTransaction {
    Name: string;
    PersonId: number;
    IsCheckboxEnabled?: boolean;
    LastUpdatedOn: Date;
    ContactNumber?: number;
}

export class RecruitmentOfferDetailsStage extends MandateTransaction {
    Name: string;
    PersonId: number;
    IsCheckboxEnabled?: boolean;
    LastUpdatedOn: Date;
    ContactNumber?: number;
    DocumentId: number;
    LstDocumentDetails?: MandateDocuments[];
}

export class RecruitmentCandidateAcceptedStage extends MandateTransaction {
    Name: string;
    PersonId: number;
    IsCheckboxEnabled?: boolean;
    LastUpdatedOn: Date;
    ContactNumber?: number;
    DocumentId: number;
    ExpectedDOJ?: Date;
    OfferedSalary?: number;
    OfferDetailsId?: number;
}

export class RecruitmentCandidateRejectedStage extends MandateTransaction {
    Name: string;
    PersonId: number;
    IsCheckboxEnabled?: boolean;
    LastUpdatedOn: Date;
    ContactNumber?: number;
    DocumentId: number;
}


export class RecruitmentCandidateOnholdConsideringStage extends MandateTransaction {
    Name: string;
    PersonId: number;
    IsCheckboxEnabled?: boolean;
    LastUpdatedOn: Date;
    ContactNumber?: number;
    DocumentId: number;
}

export class RecruitmentCandidateJoinedStage extends MandateTransaction {
    Name: string;
    PersonId: number;
    IsCheckboxEnabled?: boolean;
    LastUpdatedOn: Date;
    ContactNumber?: number;
    DocumentId: number;
    ExpectedDOJ?: Date;
    OfferedSalary?: number;
    OfferDetailsId?: number;
}

