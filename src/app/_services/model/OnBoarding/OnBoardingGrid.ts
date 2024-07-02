export class OnBoardingGrid {
    
    Id: number;
    ClientId: number;
    ClientName: string;
    ClientContractId: number;
    ClientContractCode: string;
    CandidateId: number
    CandidateName : string;
    RequestedForm : string;
    ExpectedDOJ: string;
    RequestedOn : string;
    Status: string;
    PendingAt: string;
    
    ProcessTransactionId:number;
    ActionTransactionId: number;//
  
    ContractId:number;
    ContractName:string;
    MandateAssignmentId: number;
    Mandate:string;
  
    RequestedFor: string;
  
    StatusId:number;
  
    PendingAtUserId:number;
    PendingAtUserName:string;
    RejectedByUserId:number;
    RejectedByUserName: string;
    RejectionReason:string;
    EmploymentType: any;

}