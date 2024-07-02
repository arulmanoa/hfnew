import {BaseModel} from './Common/BaseModel';

export class TemplateCategory extends BaseModel
{
    Id: number = 0;
    Code: string;
    Description: string;
    ImplementationCompanyId:number=0;
    ClientId:number=0;
    ClientContractId:number=0;
    Query:string;
    Fields:string;
    Status:number = 0;   

      
}