import { UIMode } from 'src/app/_services/model/Common/BaseModel';
export class PayrollVerificationRequest {
    Id: number;

    CompanyId: number;

    ClientId: number;

    ClientContractId: number;

    PayPeriodId: number;

    PayPeriodName: string;

    AttdanceStartDate: Date | string;

    AttdanceEndDate: Date | string;

    ClientContactId: number;

    ClientContactDetails: string;

    TeamIds: number[];

    RequestedBy: string;

    RequestedOn: Date | any;

    ApproverId: string;

    ApproverLogOn: Date | string;

    RequestRemarks: string;

    ApproverRemarks: string;

    ObjectStorageId: number;

    Status: number;

    LstPVRDetails: PayrollVerificationRequestDetails[];

    ModeType: UIMode;

}


export class PayrollVerificationRequestDetails {
    Id: number;

    PVRId: number;

    TimeCardId: number;

    EmployeeId: number;

    EmployeeName: string;

    IsActive: boolean;

    LastUpdatedBy: string;

    LastUpdatedOn: Date | string;

    RequestRemarks: string;

    ApproverRemarks: string;

    Status: number;

    ModeType: UIMode;

}

export enum PVRStatus {
    NotInitiated = 0,
    Initiated = 1,
    Approved = 2,
    PartiallyApproved = 3,
    Rejected = 4,
    Voided = 5
}


export class SubmittionForVerification {
    CompanyId: number;
    ClientId: number;
    ClientContractId: number;
    TeamIds: number[];
    PayPeriodId: number;
    EmployeeIds: [     
    ];
    PISId: number;
    PVRId: number;
    PVRIds: number[
        
    ];
    IsDownloadExcelRequired: boolean;
    ObjectStorageId: number;
    RequestedBy: number;
    RequestedOn: any;
    GeneratedRecords: number;
    IsPushrequired: boolean;
    docbytes: string
}