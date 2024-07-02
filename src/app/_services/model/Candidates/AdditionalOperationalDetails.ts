import { BaseModel } from "../Common/BaseModel";
import { UIMode } from "../UIMode";

export class AdditionalOperationalDetails extends BaseModel  {
  CandidateId: number;
  OfferDetailsId: number;
  EmployeeId: number;
  IsUniformIssued: boolean;
  NumberOfUniformSetsIssued: number;
  IsFingerPrintRegistered: boolean;
  IsFormScanned: boolean;
  IsIDCardIssued: boolean;
  IsInterviewedEarlier: boolean;
  EarlierInterviewedOn: Date;
  EarlierInterviewedBy: string;
  EarlierInterviewResult: string;
  IsEmployedByUsEarlier: boolean;
  EarlierEmployeeId: string;
  EarlierEmploymentStartDate: Date;
  EarlierEmploymentEndDate: Date;
  EarlierDivision: number;
  EarlierDepartment: number;
  ReasonForLeaving: string;
  IsChronicIllness: boolean;
  ChronicIllnessDetails: string;
  IsPreparingForCompetitiveExam: boolean;
  CompetitiveExamDetails: string;
  IsConvictedByPolice: boolean;
  PoliceCaseDetails: string;
  IsBlackListCheckDone: boolean;
  Modetype : UIMode
  Status : number
  

  constructor() {
    super();  
    // Initialize default values or leave them as undefined as needed.
    this.IsUniformIssued = false;
    this.IsFingerPrintRegistered = false;
    this.IsFormScanned = false;
    this.IsIDCardIssued = false;
    this.IsInterviewedEarlier = false;
    this.IsEmployedByUsEarlier = false;
    this.IsChronicIllness = false;
    this.IsPreparingForCompetitiveExam = false;
    this.IsConvictedByPolice = false;
    this.IsBlackListCheckDone = false;
  }
}