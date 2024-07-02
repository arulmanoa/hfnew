import { BaseModel } from "../Common/BaseModel";
import { WorkFlowInitiation } from '../OnBoarding/WorkFlowInitiation';

export class EmployeeTransitionGroup extends BaseModel {
    Remarks: string;
    CustomData1: string;
    CustomData2: string;
    CustomData3: string;
    Status: EmployeeTransitionGroupStatus;
    LstCandidateEmployeeMigration: CandidateEmployeeMigration[];

}

export enum EmployeeTransitionGroupStatus {
    Initiated = 1,
    Success = 2,
    Failed = 3,
    PartialDone = 4
}

export class CandidateEmployeeMigration {
    ModuleTransactionId: number;
    CandidateId: number;
    UserId: number;
    PersonId: number;
    ClientId: number;
    ClientContractId: number;
    EmployeeCode: string;
    CreatedBy: string;
    PersonDetails: Person;
    IsValid: boolean;
    Message: string;
    Status: EmployeeMigrationStatus;
    IsReleaseAppointmentLetter: boolean;
    objWorkflowInitiation: WorkFlowInitiation;
    TransitionGroupId: number;
    CCMails : String;
    EffectivePayPeriod:number;
    TeamId:number;
    ActualDateOfJoining:any
}


export enum EmployeeMigrationStatus {
    PushedToQueue = 1,
    PushedtoQueueFailed = 2
}

export class Person extends BaseModel {
    FirstName: string;
    LastName: string;
    DOB: Date | string | null;
    FatherName: string;
    PrimaryMobileCountryCode: string;
    PrimaryMobile: string;
    PrimaryEmail: string;
    CreatedCompanyId: number;
    LastUpdatedCompanyId: number;
    Status: number;
}

export const _EmployeeTransitionGroup: EmployeeTransitionGroup = {
    Id: 0,
    Remarks: '',
    CustomData1: '',
    CustomData2: '',
    CustomData3: '',
    Status: 0,
    LstCandidateEmployeeMigration: []
}


export const _CandidateEmployeeMigration: CandidateEmployeeMigration = {
    ModuleTransactionId: 0,
    CandidateId: 0,
    UserId: 0,
    PersonId: 0,
    ClientId: 0,
    ClientContractId: 0,
    EmployeeCode: '',
    CreatedBy: '',
    PersonDetails: null,
    IsValid: false,
    Message: '',
    Status: 0,
    IsReleaseAppointmentLetter: false,
    objWorkflowInitiation: null,
    TransitionGroupId: 0,
    CCMails : '',
    EffectivePayPeriod:0,
    TeamId:0,
    ActualDateOfJoining:null
};

// export const _Person :  Person = {
//     Id : 0,
//     FirstName : '',
//     LastName: '',
//     DOB: new Date,
//     FatherName: '',
//     PrimaryMobileCountryCode: '',
//     PrimaryMobile: '',
//     PrimaryEmail: '',
//     CreatedCompanyId: 0,
//     LastUpdatedCompanyId: 0,
//     Status: 0,
// }


export class MigrationResult {

    Remarks: string;
    CustomData1: string
    CustomData2: string
    CustomData3: string
    Status: number
    LstCandidateEmployeeMigration: CandidateEmployeeMigration[]
    Id: number
    CreatedOn: string
    LastUpdatedOn: string
    CreatedBy: string
    LastUpdatedBy: string
}
export class MigratedCandidateDetailsList
    {
        LstMigratedCandidateDetails:MigratedCandidateDetails[]

    }

export class MigratedCandidateDetails 
{
     EmployeeId :number
     EmployeeCode :number
     IsMigrated :number
     MigratedOn?:Date
     MigratedBy?:string
     Id: number;
    LastUpdatedBy?:string;
    LastUpdatedOn?:Date;
  
}