import {BaseModel} from './Common/BaseModel';

export class Template extends BaseModel
{
        Id:number = 0;
        ImplementationCompanyId: number=0;
        ClientId: number = 0;
        ClientContractId: number = 0;
        Code: string;
        Name: string;
        Description: string;
        TemplateCategoryId: number = 0;
        Type: number = 0;
        Query: string = "";
        HasHeader: boolean =false;
        HasFooter: boolean =false;
        HeaderHeight: number=0;
        FooterHeight: number =0;
        Subject: string = "";
        Body: string;
        Header: string;
        Footer: string;
        BaseURLForCSS: string="";
        BaseURLForImages: string="";
        OuputFileName: string="";
        OutputFileExtension: string="";
        ValidFrom: Date | null = null;
        ValidTill: Date | null = null;
        Status: number;

        TemplateCategoryCode: string="";
        ClientCode:string="";
        ClientContractCode:string="";
        CompanyId:any;
}