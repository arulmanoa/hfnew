export class LstPersonDropDownValues {    
LstCountry: Country[];   
LstqualificationTypes : QualificationType[];
LstyearofPassings :YearofPassing[];
LstcourseTypes : CourseType[];
LstproficiencyTypes : ProficiencyTypes[];
LstrequirementJobTypes : RequirementJobType[];
LstemploymentTypes : EmploymentType[];
LstpersonIdTypes : PersonIdType[];

}

export class QualificationType {
      Id: number;
      Name: string;}
export class YearofPassing {
      Id: number;
      Name: string;}
export class CourseType {
      Id: number;
      Name: string;}
export class ProficiencyTypes {
      Id: number;
      Name: string;
}
export class RequirementJobType {
      Id: number;
      Name: string;
}
export class EmploymentType {
      Id: number;
      Name: string;
}
export class PersonIdType {
      Id: number;
      Name: string;
}
export class Country {
      Id: number;
      Name: string;
      CountryAbbr: string;
      ListOfState: State[];
}

export class State {
      Id: number;
      Name: string;
      CountryId: number;
      ListOfCity: City[];
}

export class City {
      Id: number;
      Name: string;
      StateID: number;
}
