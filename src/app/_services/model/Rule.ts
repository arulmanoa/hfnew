import {BaseModel} from './Common/BaseModel';

export class Rule extends BaseModel {
    Id: number;
    RuleSetId?: number;
    ImplementationCompanyId?: number;
    Code?: string;
    Name?: string;
    Description?: string;
    FormattedPhrase?: string;
    HtmlData?: string;
    ExecutionOrder?: number;
    Properties?: string;
    GroupId?: number;
    Status: number;
}


// export class Rule extends BaseModel {
//     Id?: number;
//     RulesetId?: number;
//     ImplementationCompanyId?: number;
//     Code?: string;
//     Name?: string;
//     Description?: string;
//     FormattedPhrase?: string;
//     HtmlData?: string;
//     ExecutionOrder?: number;
//     Properties?: string;
//     GroupId?: number;
//     Status: number;
// }
