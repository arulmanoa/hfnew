import { LoginSessionDetails } from "./LoginSessionDetails";

export class PersonExpectation{
      Id? : number;
      PersonId? : number;
      JobType? : number;
      EmploymentType? : number;
      PreferredJobLocation? : string;
      ExpectedPay? : number;
      Frequency? : number;
      Role? : string;
      Designation? : string;
      DesignationLevel? : string;
      Response? : number;
      Status? : number;
      LastUpdatedOn? : Date;
      LastUpdatedBy? : string;
      LstPersonDocument? : PersonDocument[];
}

export class PersonDetailsUpdate {
      SessionDtls?: LoginSessionDetails;
      OldmandatesDetails?: PersonDetails;
      NewmandatesDetails?: PersonDetails;
  }

export class PersonWorkExperience{
      Id? : number;
      PersonId? : number;
      CompanyName? : string;
      CurrentCompany? : string;
      Designation? : string;
      Industry? : string;
      FunctionalArea? : string;
      ResponsibleFor? : string;
      StartDate? : Date;
      EndDate? : Date;
      WorkLocation? : string;
      LastDrawnSalary? : number;
      NoticePeriod? : number;
      Status? : number;
      LastUpdatedOn? : Date;
      LastUpdatedBy? : string;
}

export class PersonSkillSets{
      Id? : number;
      PersonId? : number;
      KeySkills? : string;
      Experience? : number;
      ProficiencyTypes? : number;
      LastUsedDate? : Date;
      Status? : number;
      LastUpdatedOn? : Date;
      LastUpdatedBy? : string;

}
export class PersonQualifications{
          Id?: number;
          PersonId? : number;
          Type? : number;
          CourseType?:number;
          EducationDegree? : string;
          InstitutionName? : string;
          YearOfPassing? : number;
          ScoringPercentage? : number;
          Status? : number;
          LastUpdatedOn? : Date;
          LastUpdatedBy? : string;
          LstPersonDocument? :PersonDocument[];
 }
export class PersonContact{
            
            Id ?:number;
            PersonId?:number;
            PrimaryContactNumber?:number;
            AlternateContactNumber?:number;
            PrimaryEmailId?:string;
            AlternateEmailId?:string
            CommunicationAddress?:string;
            CommunicationCity?:number;
            CommunicationState?:number; 
            CommunicationCountry?:number; 
            CommunicationPinCode?:number; 
            PermanentAddress?:string;
            PermanentCity?:number; 
            PermanentState?:number; 
            PermanentCountry?:number; 
            PermanentPinCode?:number; 
            Status?:number; 
            LastUpdatedBy?:string; 
            LastUpdatedOn?:Date; 
        }

export class PersonDocument{
    Id?:number;
    ReferenceId?:number;
    PersonDocumentId?:number;
    Category?:number;
    Status?:number;
    LastUpdatedOn?:Date;
    LastUpdatedBy?:string;
    DocumentReferenceSetId?:number;
    FileName?: string;
}

export class PersonDetails {
    Id?: number;
    Name?: string;
    SurName?: string;
    DateOfBirth?: Date;
    Gender?: string;
    IdType?: number;
    IdValue?: string;
    Status?: number;
    CreatedBy?: number;
    CreatedOn?: Date;
    LastUpdatedBy?: string;
    LastUpdatedOn?: Date;
    LstPersonContact?: PersonContact[];
    LstPersonDocument?: PersonDocument[];
    LstPersonQualifications?:PersonQualifications[];
    LstPersonSkillSets?:PersonSkillSets[];
    LstPersonWorkExperience?:PersonWorkExperience[];
    LstPersonExpectation?:PersonExpectation[];
}





