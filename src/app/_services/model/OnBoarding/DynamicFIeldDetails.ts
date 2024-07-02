import { ControlElement } from "src/app/views/generic-form/form-models";
import { BaseModel } from "../Common/BaseModel";

export class DynamicFieldDetails extends BaseModel {
    CompanyId: number;
    ClientId: number;
    ClientContractId: number;
    TeamId: number;
    CandidateId: number;
    EmployeeId: number;
    ControlElemetsList: ControlElement[];

}

export class DynamicFieldsValue extends BaseModel {
    CandidateId: number;

    EmployeeId: number;

    FieldValues: FieldValues[];


}


export class FieldValues {
    FieldName: string;

    Value: string;

    MultipleValues: any[];

    ParentFieldName: string;
}