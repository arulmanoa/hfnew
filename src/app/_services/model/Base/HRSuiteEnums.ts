export enum Gender {
  
    Male = 1,
    Female = 2,
    TransGender = 3
}

export enum Nationality {
  
    Indian = 1,
    Non_Indian = 2
}

export enum MaritalStatus {

    Single = 1,
    Married = 2,
    Separated = 3,
    Divorced = 4,
    Widow = 5,
    Widower  = 6
}

export enum BloodGroup {
    O_Positive = 1,
    O_Negative = 2,
    A_Negative = 3,
    A_Positive = 4,
    B_Negative = 5,
    B_Positive = 6,
    AB_Negative = 7,
    AB_Positive = 8
}

export enum RequestBy {
    Self = 1,
    OnBehalfOf = 2,
}

export enum RequestFor {
    OfferLetter = 1,
    AppointmentLetter = 2,
}

export enum OnBoardingType {
    Flash = 1,
    Proxy = 2,
}

export enum Relationship {
    Father = 1,
    Mother = 2,
    Spouse = 3,
    Son = 4,
    Daughter = 5,
    Guardian = 6,
    Father_in_law = 7,
    Mother_in_law = 8,

}

export enum RelationshipDependent {
  Self = 0,
  Father = 1,
  Mother = 2,
  Spouse = 3,
  Son = 4,
  Daughter = 5, 
  Dependent_Sister = 9,
  Dependent_Brother = 10

}


export enum ScoringType {
    Percentage = 1,
    CGPA = 2
}

export enum GraduationType {
    School = 1,
    Graduate = 2,
    Post_Graduate = 3,
    Doctorate = 4,
    Certification = 5,
    Diploma = 6
}

export enum CourseType {
    FullTime = 1,
    PartTime = 2,
    DistanceLearning = 3
}


export enum RejectionReason
   {
       Salary =1, 
       WorkLocation = 1,
       Designation = 1,
       Others = 2
   }


   export enum AcceptanceStatus
   {
       OL_Accepted=1,
       OL_Rejected=2,
       AL_Accepted=3,
       AL_Rejected=4
   }

   export enum ELCTransactionType {
    SALARYREVISION = 1,    
    REDESIGNATION = 2, 
    RELOCATION = 3, 
    DESIGNATION_RELOCATION = 4, 
    PROMOTION = 5,
    TERMINATION = 6, 
}

export enum PaymentType {
    // Daily = 1,
    // Weekly = 2,
    // Monthly = 3,

    Hourly = 1,
    Daily = 2,
    Monthly = 3,
    Mixed = 4
}
export enum Occupation {
  Housewife = 1,
  Salaried = 2,
  Business = 3,
  GovtEmployee = 4,
  Student = 5,
  Others = 6
}

export enum BaseURLType {
  HRSuiteAPI = 0,
  ImportAPI = 1,
  ReportsAPI =  2,
  IntegrationAPI = 3,
  FinanceAPI = 4,
  AdminAPI = 5
}

export enum Salutation {
    'Mr.'= 1,
    'Mrs.' = 2,
    'Late' = 3
}