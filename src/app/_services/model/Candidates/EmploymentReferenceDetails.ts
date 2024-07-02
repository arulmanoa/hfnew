import { BaseModel } from "../Common/BaseModel";
import { UIMode } from "../UIMode";

export class EmploymentReferenceDetails extends BaseModel {

  CompanyId: number;
  ClientId: number;
  CandidateId: number;
  EmployeeId: number;
  Type: number;
  Name: string;
  Organization: string;
  Designation: string;
  Email: string;
  ContactNumber: string;
  Department: string;
  Location: string;
  Status: boolean;
  Modetype: UIMode;
}