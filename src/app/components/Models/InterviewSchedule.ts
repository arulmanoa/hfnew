export const _InterviewScheduleDetailsValues: InterviewScheduleDetails = {

    Id: 0,
    InterviewType: 0,
    InterviewLevel: 0,
    InterviewVenue: '',
    InterviewerEmailID: '',
    InterviewerContactNumber: '',
    InterviewDate: null,
    InterviewStartTime: null,
    InterviewEndTime: null,
    InterviewerName: '',
    InterviewerFeedback: '',
    InterviewerFeedbackReceivedOn: null,
    PersonFeedback: '',
    PersonFeedbackReceivedOn: new Date,
    LevelCleared: true,
    NoShow: false,
    Remarks: '',
    Status: 1,
    LastUpdatedOn: null,
    LastUpdatedBy: '',
    PersonId: 0,
    InterviewTypeName: '',
    InterviewLevelName: '',
};


export class InterviewSchedule {
    Id?: number;
    MandateTransactionID?: number;
    ClientID?: number;
    PersonID?: number;
    CandidateAssessmentReportID?: number;
    InterviewScheduledBy?: number;
    IsCleared?: boolean;
    RecruiterContactNumber?: string;
    ScheduleCreationDate?: Date;
    Remarks?: string;
    Status?: number;
    LastUpdatedOn?: Date;
    LastUpdatedBy?: string;
    LstInterviewScheduleDetails?: InterviewScheduleDetails[];
    Name?: string;
    constructor() {

    }
}


export class InterviewScheduleDetails {

    Id?: number;
    InterviewType?: number;
    InterviewLevel?: number;
    InterviewVenue?: string;
    InterviewerEmailID?: string;
    InterviewerContactNumber?: string;
    InterviewDate?: Date;
    InterviewStartTime?: Date;
    InterviewEndTime?: Date;
    InterviewerName?: string;
    InterviewerFeedback?: string;
    InterviewerFeedbackReceivedOn?: Date;
    PersonFeedback?: string;
    PersonFeedbackReceivedOn?: Date;
    LevelCleared?: boolean;
    NoShow?: boolean;
    Remarks?: string;
    Status?: number;
    LastUpdatedOn?: Date;
    LastUpdatedBy?: string;
    PersonId?: number;
    InterviewTypeName?: string;
    InterviewLevelName?: string;
}
export const _InterviewScheduleValues: InterviewSchedule = {
    Id: 0,
    MandateTransactionID: 0,
    ClientID: 0,
    PersonID: 0,
    CandidateAssessmentReportID: 0,
    InterviewScheduledBy: 0,
    IsCleared: false,
    RecruiterContactNumber: '',
    ScheduleCreationDate: null,
    Remarks: '',
    Status: 1,
    LastUpdatedOn: null,
    LastUpdatedBy: '',
    LstInterviewScheduleDetails: [],
    Name: ''
};


