import { UIMode } from "../Common/BaseModel";
import { ObjectStorageDetails } from "./ObjectStorageDetails";
import { JobType } from "./CandidateOfferDetails";
import { EmployementType } from "./CandidateLookupModel";
import { CandidateDocuments } from "./CandidateDocuments";

export enum ScoringType {
  Percentage = 1,
  CGPA = 2
}

export enum GraduationType {
  School = 1,
  UG = 2,
  PG = 3,
  Doctorate = 4,
  Certification = 5
}

export enum CourseType {
  FullTime = 1,
  PartTime = 2,
  DistanceLearning = 3
}

export enum ProficiencyType {
  Beginner = 1,
  Intermediate = 2,
  Expert = 3
}

export enum PayFrequency {
  Weekly = 1,
  Monthly = 2,
  Fortnight = 3,
  Yearly = 4,
  Quartely = 5,
  Custom = 6
}

export class CandidateCareerDetails {
  Id: number;
  CandidateId: number;
  Industry: string;
  LstIndustry: string[];
  FunctionalArea: string;
  ReferrenceData: string;
  LstCandidateReference: CandidateReference[];
  ExpectationData: string;
  LstExpectation: Expectation[];
  Modetype: UIMode;
}

export class Qualification {
  Id: number;
  CandidateId: number;
  GraduationType: GraduationType;
  EducationDegree: string;
  CourseType: CourseType;
  FieldOfStudy: string;
  InstitutionName: string;
  UniversityName: string;
  YearOfPassing: number;
  ScoringType: ScoringType;
  ScoringValue: number;
  Status: number;
  Location: string;
  Link: string;
  DocumentId: number;
  StorageDetails: ObjectStorageDetails;
  CandidateDocumentId?: number;
  CandidateDocument?: CandidateDocuments;
  Modetype: UIMode;
  EmployeeId?: number;
}

export class WorkExperience {
  Id: number;
  CandidateId: number;
  CompanyName: string;
  IsCurrentCompany: boolean;
  DesignationHeld: string;
  WorkLocation: string;
  StartDate: string;
  EndDate: string;
  Months: number;
  ResponsibleFor: string;
  FunctionalArea: [];
  Industry: string;
  LastDrawnSalary: number;
  NoticePeriod: number;
  Status: number;
  CandidateDocumentId?: number;
  CandidateDocument?: CandidateDocuments;
  Modetype: UIMode;
  EmployeeId?: number;
  OldEmployeeId: string;
  HREmailID: string;
  ManagerName: string;
  ManagerEmailID: string;
  ManagerContactNumber: string;
  ManagerDesignation: string;
}

export class SkillDetails {
  Id: number;
  CandidateId: number;
  Name: string;
  Specialization: string;
  Version: string;
  YearsOfExperience: number;
  Proficiency: ProficiencyType;
  LastUsedDate: string;
  Status: number;
  Modetype: UIMode;
}

export class WorkPermit {
  Id: number;
  CandidateId: number;
  WorkPermitAvailable: string;
  CountryName: string;
  WorkPermitType: string;
  ValidFrom: string;
  ValidTill: string;
  Status: number;
  Modetype: UIMode;
  CandidateDocumentId: number;
  CandidateDocument: CandidateDocuments;
}

export class CandidateReference {
  Name: string;
  Organisation: string;
  Designation: string;
  MobileNumber: string;
  EmailId: string;
  Address: string;
  Remarks: string;
}

export class Expectation {
  Id: number;
  CandidateId: number;
  IndustryType: string;
  FunctionalArea: string;
  JobType: JobType
  Designation: string;
  DesignationLevel: string;
  EmploymentType: EmployementType;
  PreferredJobLocation: string;
  ExpectedPay: number;
  CTCFrom: number;
  CTCTo: number;
  Shifts: string[];
  Frequency: PayFrequency;
  Status: number;
}