import { UserDetails } from './UserDetails';
import { MandateStage } from './MandateStage';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';


export class LstDropDownValues {
      LstCLient: Client[];
      LstCountry: Country[];
      LstFunctionalAreas: FunctionalArea[];
      LstGenericCode: GenricCode[];
      LstMandateStatus: MandateStatus[];
      LstMandateTypes: MandateType[];
      LstQualification: Qualification[];
      LstTargetIndustries: TargetIndustry[];
      LstUser: UserDetails[];
      LstMandateStage: MandateStage[];
      LstCityBusinessPartners: CityBusinessPartners[];
      LstBusinessPartners: BusinessPartners[];
      LstBranch: Branch[];
}

export class MandateStatus {
      Code: string;
      Id: Number;
      Name: string;
}

export class Qualification {
      Code: string;
      GenericCodeTypeId: Number;
      Id: Number;
      Name: string;
}
export class Category {
      CategoryId: number;
      Name: string;
}
export class SelfAllocate {
      SelfAllocate: boolean;
      Name: string;
      Id: number;
}
export class Confidential {
      Confidential: boolean;
      Name: string;
      Id: number;
}


export class Gender {
      GenderPreference: number;
      Name: string;
      Id: number;
}


export class FunctionalArea {
      Id: number;
      Name: string;
}

export class MandateType {
      Id: number;
      Name: string;
}

export class TargetIndustry {
      Id: number;
      Name: string;
}

// M List
export class LstContract {
      Id: number;
      ClientId: number;
      Name: string;
      Code: string;
      StartDate: string;
      EndDate: string;
}

export class Contract {
      Id: number;
      Name: string;
}

export class LstClientLocation {
      Id: number;
      ClientId: number;
      LocationCode: string;
      LocationName: string;
      LocationSPOC_Name: string;
      BillingAddress: string;
      ShippingAddress: string;
      GST_Number: string;
      Status: number;
      SPOC_Email: string;
      SPOC_ContactNumber: string;
}
// M List
export class Client {
      Id: number;
      ClientCode: string;
      ClientName: string;
      AliasName: string;
      ClientReferenceID: number;
      Industry: string;
      Status: number;
      LastUpdateOn: string;
      LastUpdatedBy: number;
      LstClientLocation: LstClientLocation[];
      LstContract: LstContract[];

}


// M List
export class Country {
      Id: number;
      Name: string;
      CountryAbbr: string;
      ListOfState: State[];
}
// M List
export class State {
      Id: number;
      Name: string;
      CountryId: number;
      ListOfCity: City[];
}

// M List
export class City {
      Id: number;
      Name: string;
      StateID: number;
}

export class GenricCode {
      Id: number;
      Code: string;
      Name: string;
      GenricCodeTypeId: number;
}





export class Task {
      ID: number;
      Subject: string;
      StartDate: string;
      DueDate: string;
      Status: string;
      Priority: string;
      Completion: number;
}
export class Employee {
      ID: number;
      TLName: string;
      startDate: string;
      EndDate: string;
      TargetNo: string;
      RemarksNo: string;
      Tasks: Task[];
}

export class ReqStatus {
      Id: number;
      Name: string;
}

export class NoticePeriod {
      Id: number;
      Name: string;
}




export class InterviewType {
      Id: number;
      Name: string;
}

export class InterviewLevel {
      Id: number;
      Name: string;
}
export class RejectedByCategory {
      Id: number;
      Name: string;
}

export class ServiceFeeType {
      Id: number;
      Name: string;
}



export class BusinessPartners {
      Id: number;
      BusinessPartnerCode: string;
      BusinessPartnerName: string;
      BusinessPartnerSPOC: string;
      BPReferenceID: number;
      Location: string;
      Address: string;
      GSTNumber: string;
      Status: number;
      CommencementDate: Date;
      RenewalDate: Date;
}


export class CityBusinessPartners {
      Id: number;
      CityBusinessPartnerCode: string;
      CityBusinessPartnerName: string;
      CityBusinessPartnerSPOC: string;
      CBReferenceID: number;
      Location: string;
      Address: string;
      GSTNumber: string;
      Status: number;
      CommencementDate: Date;
      RenewalDate: Date;
}

// M List
export class Branch {
      Id: number;
      Code: string;
      Description: string;
}

export class EntityType {
      Id: number;
      Name: string;
}

export class SharingType {
      Id: number;
      Name: string;
}

export interface LeaveGroup {
      Id:        number;
      Code:      string;
      Name:      string;
      CompanyId: number;
      ClientId:  number;
  }
