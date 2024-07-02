import { MandatesDetails, MandatesDetailsUpdate } from '../Models/MandatesDetails';
import {
    MandateRequirementDetails, MandatesRequirementDetailsView,
    MandateAssignmentDetailsUpdate,
    RecruitmentLongListedStage,
    RecruitmentInterviewScheduleStage,
    RecruitmentShortListedStage
} from '../Models/MandateRequirementDetails';
import { Employee } from '../Models/look-up-model';

export const _MandatesDetailsValues: MandatesDetails = {
    Id: 0,
    ClientID: 0,                                    // Checked
    PSAID: 0, // Contract ID                        // Checked
    EnquiryReferenceID: 0, // --No Required
    PO_Number: '', // --No Required
    AccountManagerID: 0,  // --No Required
    MandateTypeId: 0,  // -- Null                   //  checked
    CategoryId: 1,                                  //  checked
    RequestedBy: 1, // Session User Id
    RequestedOn: new Date(), //  no use
    JobTitle: '',                                    // Checked
    FunctionalAreaId: 0,                                // Checked
    KeySkills: '',                                   // Checked
    QualificationId: 1,                              // Checked
    Confidential: false, //  true or false           // Checked
    SelfAllocate: false,                             // Checked
    Exclusive: false,  // default False
    TargetIndustryId: 0,                             // Checked
    TargetCompanies: '',                                // Checked
    NoPoachCompanies: '',                               // Checked
    GenderPreference: 0,                            // Checked
    Remarks: '',
    LastUpdatedOn: new Date(), // Not Required
    LastUpdatedBy: '', // Not Required
    FileNames: [], // Not Required
    Status: 0,
    NoticePeriodRestriction: 7,
    ListRequirementDetails: [] = [],
    //  ListRequirementDetails: [
    //     {
    //         LstDocumentDetails: [{
    //             Id: 0,
    //             RefId: 0,
    //             DocumentId: 0,  // Document Result fill the ID
    //             RefCode: '',
    //             Status: 0,
    //             DocCategoryId: 0,
    //             LastUpdatedOn: new Date,
    //             LastUpdatedBy: ''
    //         }],
    //         isVisible: true, //
    //         isSaved: false, //
    //         Id: 0, //
    //         MandateId: 0, // Not Required
    //         ClientContactID: 1,  //
    //         WorkLocation: '',    //
    //         CityId: 0,
    //         StateId: 0,
    //         RequestedResourcesNumber: 0,
    //         RequestedClosureDate: new Date,
    //         Qualification: '',
    //         ExperienceFrom: 0,
    //         ExperienceTo: 0,
    //         RelevantExperienceFrom: 0,
    //         RelevantExperienceTo: 0,
    //         AnnualCTCFrom: 0,
    //         AnnualCTCTo: 0,
    //         Remarks: '',
    //         Status: 1,  //  Default status - Inprogress or open  100   // Reuirment Detail Comntact fill Drop // state and city
    //         Code: '',
    //         LastUpdatedOn: new Date(),
    //         LastUpdatedBy: '',
    //         FileNames: [],
    //     }],
    LstDocumentDetails: [],
};


export const _RequirementDetailsDefaultValues: MandateRequirementDetails = {
    LstDocumentDetails: [{
        Id: 0,
        RefId: 0,
        DocumentId: 0,  // Document Result fill the ID
        RefCode: '',
        Status: 0,
        DocCategoryId: 0,
        LastUpdatedOn: new Date,
        LastUpdatedBy: '',
        FileName: ''
    }],
    Id: 0, //
    MandateId: 0, // Not Required
    ClientContactId: 1,  //
    WorkLocation: '',    //
    CityId: 0,
    StateId: 0,
    CountryId: 0,
    RequestedResourcesNumber: 0,
    RequestedClosureDate: new Date,
    Qualification: '',
    ExperienceFrom: 0,
    ExperienceTo: 0,
    RelevantExperienceFrom: 0,
    RelevantExperienceTo: 0,
    AnnualCTCFrom: 0,
    AnnualCTCTo: 0,
    Remarks: '',
    Status: 1,  //  Default status - Inprogress or open  100   // Reuirment Detail Comntact fill Drop // state and city
    Code: '',
    LastUpdatedOn: new Date(),
    LastUpdatedBy: '',
    PublishJob: false,
    FileNames: [],
};
// Rquiement Details --- Job Code
// Mandate Type Repository

export const _MandatesRequirementDetailsViewDefaultValues: MandatesRequirementDetailsView = {
    LstDocumentDetails: [{
        Id: 0,
        RefId: 0,
        DocumentId: 0,  // Document Result fill the ID
        RefCode: '',
        Status: 0,
        DocCategoryId: 0,
        LastUpdatedOn: new Date,
        LastUpdatedBy: '',
        FileName: ''
    }],
    Id: 0, //
    MandateId: 0, // Not Required
    ClientContactId: 1,  //
    WorkLocation: '',    //
    CityId: 0,
    StateId: 0,
    CountryId: 0,
    RequestedResourcesNumber: 0,
    RequestedClosureDate: new Date,
    Qualification: '',
    ExperienceFrom: 0,
    ExperienceTo: 0,
    RelevantExperienceFrom: 0,
    RelevantExperienceTo: 0,
    AnnualCTCFrom: 0,
    AnnualCTCTo: 0,
    Remarks: '',
    Status: 1,  //  Default status - Inprogress or open  100   // Reuirment Detail Comntact fill Drop // state and city
    Code: '',
    LastUpdatedOn: new Date(),
    LastUpdatedBy: '',
    FileNames: [],
    StateName: '',
    ClientContact: '',
    ClosureDate: '',
    PublishJob: false
};

export const _MandatesDetailsUpdateValues: MandatesDetailsUpdate = {
    OldmandatesDetails: _MandatesDetailsValues,
    NewmandatesDetails: _MandatesDetailsValues
};


export const _MandateAssignmentDetailsUpdateValues: MandateAssignmentDetailsUpdate = {
    Id: 0,
    MandateDetailsID: 0,
    AssignmentParentID: 0,
    MandateDelegatedTo: 0,
    ManagerID: 0,
    DelegatedBy: 0,
    DelegationDate: new Date,
    TargettedResourcesNumber: 0,
    TargettedClosureDate: new Date,
    Accepted: 0,
    Status: 0,
    AcceptedOn: new Date,
    AcceptedBy: 0,
    Remarks: '',
    LastUpdatedOn: new Date,
    LastUpdatedBy: '',
    LstMandateSchedule: [],
    LstAllStageMandateTransaction: {
        RecruitmentLongListedStage: []
    },
    LstMandateTransaction: []

};

export const _recruitmentLongListedStage: RecruitmentLongListedStage[] = [{
    Name: '',
    PersonId: 0,
    IsCheckboxEnabled: false,
    LastUpdatedOn: new Date,
    ContactNumber: 0
}];
export const _recruitmentShortListedStage: RecruitmentShortListedStage[] = [{
    Name: '',
    PersonId: 0,
    IsCheckboxEnabled: false,
    LastUpdatedOn: new Date,
    ContactNumber: 0
}];

export const _recruitmentInterviewScheduleStage: RecruitmentInterviewScheduleStage[] = [{
    Name: '',
    PersonId: 0,
    IsCheckboxEnabled: false,
    LastUpdatedOn: new Date,
    ContactNumber: 0
}];

export const _employees: Employee[] = [{
    'ID': 1,
    'TLName': 'Raj',
    'startDate': '12-10-2018',
    'EndDate': '11-11-2018.',
    'TargetNo': '2',
    'RemarksNo': 'fast fill the Position',
    'Tasks': [{
        'ID': 5,
        'Subject': 'Choose between PPO and HMO Health Plan',
        'StartDate': '2013/02/15',
        'DueDate': '2013/04/15',
        'Status': 'In Progress',
        'Priority': 'High',
        'Completion': 75
    }, {
        'ID': 6,
        'Subject': 'Google AdWords Strategy',
        'StartDate': '2013/02/16',
        'DueDate': '2013/02/28',
        'Status': 'Completed',
        'Priority': 'High',
        'Completion': 100
    }, {
        'ID': 7,
        'Subject': 'New Brochures',
        'StartDate': '2013/02/17',
        'DueDate': '2013/02/24',
        'Status': 'Completed',
        'Priority': 'Normal',
        'Completion': 100
    }, {
        'ID': 22,
        'Subject': 'Update NDA Agreement',
        'StartDate': '2013/03/14',
        'DueDate': '2013/03/16',
        'Status': 'Completed',
        'Priority': 'High',
        'Completion': 100
    }, {
        'ID': 52,
        'Subject': 'Review Product Recall Report by Engineering Team',
        'StartDate': '2013/05/17',
        'DueDate': '2013/05/20',
        'Status': 'Completed',
        'Priority': 'High',
        'Completion': 100
    }]
}, {
    'ID': 12,
    'TLName': 'Ramesh',
    'startDate': '10-11-2018',
    'EndDate': '30-11-2018',
    'TargetNo': '10',
    'RemarksNo': '',
    'Tasks': [{
        'ID': 3,
        'Subject': 'Update Personnel Files',
        'StartDate': '2013/02/03',
        'DueDate': '2013/02/28',
        'Status': 'Completed',
        'Priority': 'High',
        'Completion': 100
    }, {
        'ID': 4,
        'Subject': 'Review Health Insurance Options Under the Affordable Care Act',
        'StartDate': '2013/02/12',
        'DueDate': '2013/04/25',
        'Status': 'In Progress',
        'Priority': 'High',
        'Completion': 50
    }, {
        'ID': 21,
        'Subject': 'Non-Compete Agreements',
        'StartDate': '2013/03/12',
        'DueDate': '2013/03/14',
        'Status': 'Completed',
        'Priority': 'Low',
        'Completion': 100
    }, {
        'ID': 50,
        'Subject': 'Give Final Approval for Refunds',
        'StartDate': '2013/05/05',
        'DueDate': '2013/05/15',
        'Status': 'Completed',
        'Priority': 'Normal',
        'Completion': 100
    }]
}, {
    'ID': 36,
    'TLName': 'John',
    'startDate': '1-10-2018',
    'EndDate': '1-11-2018',
    'TargetNo': '15',
    'RemarksNo': '',
    'Tasks': [{
        'ID': 16,
        'Subject': 'Deliver R&D Plans for 2013',
        'StartDate': '2013/03/01',
        'DueDate': '2013/03/10',
        'Status': 'Completed',
        'Priority': 'High',
        'Completion': 100
    }, {
        'ID': 74,
        'Subject': 'Decide on Mobile Devices to Use in the Field',
        'StartDate': '2013/07/30',
        'DueDate': '2013/08/02',
        'Status': 'Completed',
        'Priority': 'High',
        'Completion': 100
    }, {
        'ID': 78,
        'Subject': 'Try New Touch-Enabled WinForms Apps',
        'StartDate': '2013/08/11',
        'DueDate': '2013/08/15',
        'Status': 'Completed',
        'Priority': 'Normal',
        'Completion': 100
    }, {
        'ID': 117,
        'Subject': 'Approval on Converting to New HDMI Specification',
        'StartDate': '2014/01/11',
        'DueDate': '2014/01/31',
        'Status': 'Deferred',
        'Priority': 'Normal',
        'Completion': 75
    }]
}, {
    'ID': 3,
    'TLName': 'Kamal',
    'startDate': '12-2-2018',
    'EndDate': '20-2-2018',
    'TargetNo': '10',
    'RemarksNo': '',
    'Tasks': [{
        'ID': 20,
        'Subject': 'Approve Hiring of John Jeffers',
        'StartDate': '2013/03/02',
        'DueDate': '2013/03/12',
        'Status': 'Completed',
        'Priority': 'Normal',
        'Completion': 100
    }, {
        'ID': 23,
        'Subject': 'Update Employee Files with New NDA',
        'StartDate': '2013/03/16',
        'DueDate': '2013/03/26',
        'Status': 'Need Assistance',
        'Priority': 'Normal',
        'Completion': 90
    }, {
        'ID': 40,
        'Subject': 'Provide New Health Insurance Docs',
        'StartDate': '2013/03/28',
        'DueDate': '2013/04/07',
        'Status': 'Completed',
        'Priority': 'Normal',
        'Completion': 100
    }]
}];
