import { BaseModel, UIMode } from "../Common/BaseModel";
import { Nationality, MaritalStatus, BloodGroup } from "../Base/HRSuiteEnums";
import { Gender } from "src/app/components/Models/look-up-model";
import { Person } from "../Migrations/Transition";
import { EmployeeLifeCycleTransaction } from "./EmployeeLifeCycleTransaction";
import { FamilyDetails } from "./FamilyDetails";
import { EmploymentContract, _EmploymentContract } from "./EmployementContract";
import { EmployeeBankDetails } from "./EmployeeBankDetails";
import { EmployeeHousePropertyDetails } from "./EmployeeHousePropertyDetails";
import { EmployeeHouseRentDetails } from "./EmployeeHouseRentDetails";
import { EmployeeInvestmentDeductions } from "./EmployeeInvestmentDeductions";
import { EmployeeOtherIncomeSources } from "./EmployeeOtherIncomeSources";
import { EmploymentDetails } from "./EmploymentDetails";
import { CandidateDocuments } from "../Candidates/CandidateDocuments";
import { Qualification, WorkExperience } from "../Candidates/CandidateCareerDetails";
import { EmployeeTaxExemptionDetails } from "./EmployeeTaxExemptionDetails";
import { EmployeeRateset } from "src/app/_services/model/Employee/EmployeeRateset"
import { EmployeePerquisitesDetails } from "./EmployeePerquisitesDetails";
import { EmployeeJourneyDetails } from "./EmployeeJourneyDetails";

export class EmployeeDetails extends BaseModel {

  FirstName: string;
  LastName: string;
  PhotoStorage: string;
  DateOfBirth: Date | string;
  Gender: Gender;
  Nationality: Nationality;
  CountryOfOrigin: number;
  MaritalStatus: MaritalStatus | any;
  BloodGroup: BloodGroup | any;
  IsDifferentlyabled: boolean;
  DisabilityPercentage: number;
  Status: EmployeeStatus;
  CandidateId: number;
  PersonId: number;
  Code: string;
  ClientEmployeeCode: string;
  TransitionId: number;
  EmployeeObjectData: EmployeeObjectData;
  ELCTransactions: EmployeeLifeCycleTransaction[];
  EmpFamilyDtls: FamilyDetails[];
  Modetype: UIMode;
  PersonDetails: Person;
  lstEmployeeBankDetails: EmployeeBankDetails[];
  EmploymentContracts: EmploymentContract[];
  CandidateDocuments: CandidateDocuments[];
  LstEmployeeHousePropertyDetails: EmployeeHousePropertyDetails[];
  LstemployeeHouseRentDetails: EmployeeHouseRentDetails[];
  LstemployeeInvestmentDeductions: EmployeeInvestmentDeductions[];
  LstemployeeOtherIncomeSources: EmployeeOtherIncomeSources[];
  LstemploymentDetails: EmploymentDetails[];
  FatherName: string;
  PAN: string;
  UAN: string;
  ESIC: string;
  Aadhaar: string;

  EmployeeCommunicationDetails: EmployeeCommunicationDetail;
  LstEmployeeLetterTransactions: any[];
  Qualifications: Qualification[];
  WorkExperiences: WorkExperience[];
  EmployeeInvestmentMaster: EmployeeInvestmentMaster;
  LstEmployeeTaxExemptionDetails: EmployeeTaxExemptionDetails[];
  EmployeeRatesets: EmployeeRateset[];
  RelationshipName: any;
  RelationshipId: any;
  employeePayrollSummaryDetails: EmployeePayrollSummaryDetails[];
  LstemployeePerquisitesDetails: EmployeePerquisitesDetails[];
  differentlyabledPercentage: number;
  MarriageDate?: Date;
  Religion?: number;
  LstEmployeeJourneyDetails?: EmployeeJourneyDetails[];
  ActionName: ActionName; // save or update or detete
  ActionType: ActionType; // full save or profile save or bank save or family save ....
  MakerCheckerTransactionId?: number;
  Remarks: string;
}

export enum ActionType {
  fullSave = 1,
  profileSave = 2,
  familySave = 3,
  bankSave = 4,
  communicationSave = 5,
  employmentSave = 6,
  educationSave = 7
}
export enum ActionName {
  saveEmployee = 1,
  submitEmployee = 2,
  updateEmployee = 3,
  deleteEmployee = 4,
}
export enum EmployeeStatus {
  Active = 1,
  InActive = 0

}

export class EmployeeObjectData extends BaseModel {
  EmployeeId: number;
  EmployeeData: string;

}

export class EmployeeInvestmentMaster extends BaseModel {
  EmployeeId: number;
  PersonId: number;
  FinancialYearId: number;
  SlotClosureDate: any;
  ModuleProcessTransactionId: number;
  Status: number;
  Remarks: any;
  SummaryDocumentId: string;

}



export class EmployeeCommunicationDetail {
  Id: number;
  EmployeeId: number;
  LstAddressdetails: Addressdetails[];
  LstContactDetails: ContactDetails[];
  Modetype: number;
};

export class Addressdetails {
  CommunicationCategoryTypeId: number;
  CountryName: string;
  StateName: string;
  City: string;
  DistrictName: string | any;
  Address1: string;
  Address2: string;
  Address3: string;
  PinCode: string;
  CountryId: number;
  CityId: number;
  StateId: number;
  DistrictId: number;

}

export const _addressDetails_pret: Addressdetails = {

  CommunicationCategoryTypeId: 0,
  CountryName: null,
  StateName: null,
  City: null,
  DistrictName: null,
  Address1: '',
  Address2: '',
  Address3: '',
  PinCode: '',
  CountryId: 0,
  CityId: 0,
  StateId: 0,
  DistrictId: 0,

}

export const _addressDetails_perm: Addressdetails = {

  CommunicationCategoryTypeId: 1,
  CountryName: null,
  StateName: null,
  City: null,
  DistrictName: null,
  Address1: '',
  Address2: '',
  Address3: '',
  PinCode: '',
  CountryId: 0,
  CityId: 0,
  StateId: 0,
  DistrictId: 0,

}


export class ContactDetails {
  CommunicationCategoryTypeId: number;
  PrimaryMobile: string;
  PrimaryMobileCountryCode: string;
  AlternateMobile: string;
  AlternateMobileCountryCode: string;
  PrimaryEmail: string;
  AlternateEmail: string;
  EmergencyContactNo: string;
  EmergencyContactNoCountryCode?: string;
  EmergencyContactPersonName?: string;
  LandlineStd: string;
  LandLine: string;
  LandLineExtension: string;
  PrimaryFax: string;
  AlternateFax: string;
  IsDefault: boolean;
}

export const _contactDetails: ContactDetails = {

  CommunicationCategoryTypeId: 3,
  PrimaryMobile: null,
  PrimaryMobileCountryCode: null,
  AlternateMobile: null,
  AlternateMobileCountryCode: null,
  PrimaryEmail: null,
  AlternateEmail: null,
  EmergencyContactNo: null,
  EmergencyContactNoCountryCode: null,
  EmergencyContactPersonName: null,
  LandlineStd: null,
  LandLine: null,
  LandLineExtension: null,
  PrimaryFax: null,
  AlternateFax: null,
  IsDefault: false,
}

export enum EmployeeMenuData {
  Profile = 1,
  BankAccounts = 2,
  EmployeeDocuments = 3,
  MyInvestments = 4,
  PreviousEmploymentDetails = 5,
  FamilyDetails = 6,
  Education = 7,
  Experience = 8
}

export class EmployeePayrollSummaryDetails extends BaseModel {

  EmployeeId: number;

  EmployeeCode: string;

  EmployeeName: string;

  FinancialYearId: number;

  PayperiodId: number;

  IsProposed: boolean;

  HouseRentType: HouseRentType;

  HouseRentDefaultValue: string;

  TotalInvestmentAmount: number;

  TotalInvestmentApprovedAmount: number;

  TotalPerquisitesAmount: number;

  CustomData1: string;

  CustomData2: string;

  CustomData3: string;

  CustomData4: string;

  Modetype: UIMode;

}

export enum HouseRentType {
  Monthly = 0,
  Yearly = 1,
  Quartely = 2,
  Manual = 3
}

export class HtmlToPDFSrc {
  htmldata: string;
  header: string;
  footer: string;
  hasHeader: boolean;
  hasFooter: boolean;
  headerHeight: number;
  footerHeight: number;
  baseUrlForCssAndImgs: string;
  putHeaderOnFirstPage: boolean;
  putHeaderOnOddPages: boolean;
  putHeaderOnEvenPages: boolean;
  putFooterOnFirstPage: boolean;
  putFooterOnOddPages: boolean;
  putFooterOnEvenPages: boolean;
  isPageNumRequired: boolean;
}
export const _EmployeeCommunicationDetail: EmployeeCommunicationDetail = {
  Id: 0,
  EmployeeId: 0,
  LstAddressdetails: [_addressDetails_perm, _addressDetails_pret],
  LstContactDetails: [_contactDetails],
  Modetype: 0,
};


export const _EmployeeDetails: EmployeeDetails = {
  Id: 0,
  FirstName: '',
  LastName: '',
  PhotoStorage: '',
  DateOfBirth: null,
  Gender: null,
  Nationality: null,
  CountryOfOrigin: null,
  MaritalStatus: null,
  BloodGroup: null,
  IsDifferentlyabled: false,
  DisabilityPercentage: 0,
  Status: 1,
  CandidateId: 0,
  PersonId: 0,
  Code: '',
  ClientEmployeeCode: '',
  TransitionId: null,
  EmployeeObjectData: null,
  ELCTransactions: [],
  EmpFamilyDtls: [],
  Modetype: 2,
  PersonDetails: null,
  lstEmployeeBankDetails: [],
  EmploymentContracts: [_EmploymentContract],
  CandidateDocuments: [],
  LstEmployeeHousePropertyDetails: [],
  LstemployeeHouseRentDetails: [],
  LstemployeeInvestmentDeductions: [],
  LstemployeeOtherIncomeSources: [],
  LstemploymentDetails: [],
  FatherName: '',
  PAN: null,
  UAN: null,
  ESIC: null,
  Aadhaar: null,
  EmployeeCommunicationDetails: _EmployeeCommunicationDetail,
  LstEmployeeLetterTransactions: [],
  Qualifications: [],
  WorkExperiences: [],
  EmployeeInvestmentMaster: null,
  LstEmployeeTaxExemptionDetails: [],
  EmployeeRatesets: [],
  RelationshipName: '',
  RelationshipId: null,
  employeePayrollSummaryDetails: [],
  LstemployeePerquisitesDetails: [],
  differentlyabledPercentage: null,
  ActionName: ActionName.saveEmployee,
  ActionType: ActionType.fullSave,
  MakerCheckerTransactionId: 0,
  Remarks: ""

}

